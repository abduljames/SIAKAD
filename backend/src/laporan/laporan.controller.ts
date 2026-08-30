import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import type { Response } from 'express';
import { Tagihan } from '../tagihan/tagihan.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { tanggalWibHariIni } from '../common/waktu.util';

@Controller('laporan')
@UseGuards(JwtAuthGuard)
export class LaporanController {
  constructor(@InjectRepository(Tagihan) private tagihanRepo: Repository<Tagihan>) {}

  // Rekap DETAIL per santri (bukan cuma agregat per kelas) -- supaya kelihatan
  // persis siapa yang sudah bayar, belum bayar, dan menunggak. Bisa difilter
  // per Jenis Tagihan (cek lewat rincian) dan/atau per Kelas.
  private async hitungRekapDetail(jenisTagihanId?: number, kelasId?: number) {
    const where: any = {};
    if (kelasId) where.santri = { kelas: { id: kelasId } };
    const semuaTagihan = await this.tagihanRepo.find({ where, order: { createdAt: 'DESC' } });

    const hariIni = tanggalWibHariIni();
    const terfilter = jenisTagihanId
      ? semuaTagihan.filter((t) => t.rincian.some((r) => r.jenisTagihan.id === Number(jenisTagihanId)))
      : semuaTagihan;

    const baris = terfilter.map((t) => {
      const sisaTagihan = Number(t.totalTagihan) - Number(t.totalTerbayar);
      const menunggak = t.status !== 'Lunas' && t.jatuhTempo < hariIni;
      return {
        santriId: t.santri.id,
        namaSantri: t.santri.nama,
        nis: t.santri.nis,
        kelas: t.santri.kelas?.nama || 'Tanpa Kelas',
        noTagihan: t.noTagihan,
        jenisTagihan: t.rincian.map((r) => r.jenisTagihan.nama).join(', '),
        periode: t.periode,
        jatuhTempo: t.jatuhTempo,
        totalTagihan: Number(t.totalTagihan),
        totalTerbayar: Number(t.totalTerbayar),
        sisaTagihan,
        status: t.status,
        menunggak,
      };
    });

    const summary = {
      jumlahSudahBayar: baris.filter((b) => b.status === 'Lunas').length,
      jumlahBelumBayar: baris.filter((b) => b.status !== 'Lunas').length,
      jumlahMenunggak: baris.filter((b) => b.menunggak).length,
      totalTagihan: baris.reduce((s, b) => s + b.totalTagihan, 0),
      totalTerbayar: baris.reduce((s, b) => s + b.totalTerbayar, 0),
      totalTunggakan: baris.reduce((s, b) => s + b.sisaTagihan, 0),
    };

    return { baris, summary };
  }

  @Get('rekap-tagihan')
  async rekap(@Query('jenisTagihanId') jenisTagihanId?: number, @Query('kelasId') kelasId?: number) {
    return this.hitungRekapDetail(jenisTagihanId, kelasId);
  }

  @Get('rekap-tagihan/export')
  async export(
    @Query('jenisTagihanId') jenisTagihanId: number,
    @Query('kelasId') kelasId: number,
    @Res() res: Response,
  ) {
    const { baris } = await this.hitungRekapDetail(jenisTagihanId, kelasId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rekap Tagihan');
    sheet.columns = [
      { header: 'Nama Santri', key: 'namaSantri', width: 22 },
      { header: 'NIS', key: 'nis', width: 14 },
      { header: 'Kelas', key: 'kelas', width: 12 },
      { header: 'No. Tagihan', key: 'noTagihan', width: 20 },
      { header: 'Jenis Tagihan', key: 'jenisTagihan', width: 24 },
      { header: 'Periode', key: 'periode', width: 14 },
      { header: 'Total Tagihan', key: 'totalTagihan', width: 16 },
      { header: 'Total Terbayar', key: 'totalTerbayar', width: 16 },
      { header: 'Sisa Tagihan', key: 'sisaTagihan', width: 16 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Menunggak', key: 'menunggakLabel', width: 12 },
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2F1' } };
    baris.forEach((row) => sheet.addRow({ ...row, menunggakLabel: row.menunggak ? 'Ya' : '-' }));

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="rekap-tagihan.xlsx"');
    res.send(Buffer.from(buffer));
  }
}
