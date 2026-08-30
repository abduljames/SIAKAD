import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import type { Response } from 'express';
import { Tagihan } from '../tagihan/tagihan.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('laporan')
@UseGuards(JwtAuthGuard)
export class LaporanController {
  constructor(@InjectRepository(Tagihan) private tagihanRepo: Repository<Tagihan>) {}

  private async hitungRekap(periode?: string, kelasId?: number) {
    const where: any = {};
    if (periode) where.periode = periode;
    if (kelasId) where.santri = { kelas: { id: kelasId } };
    const semuaTagihan = await this.tagihanRepo.find({ where });

    const perKelas = new Map<
      string,
      { kelas: string; totalTagihan: number; totalTerbayar: number; totalTunggakan: number; jumlahSantriMenunggak: Set<number> }
    >();

    for (const t of semuaTagihan) {
      const namaKelas = t.santri?.kelas?.nama || 'Tanpa Kelas';
      if (!perKelas.has(namaKelas)) {
        perKelas.set(namaKelas, {
          kelas: namaKelas,
          totalTagihan: 0,
          totalTerbayar: 0,
          totalTunggakan: 0,
          jumlahSantriMenunggak: new Set(),
        });
      }
      const row = perKelas.get(namaKelas)!;
      row.totalTagihan += Number(t.totalTagihan);
      row.totalTerbayar += Number(t.totalTerbayar);
      row.totalTunggakan += Number(t.totalTagihan) - Number(t.totalTerbayar);
      if (t.status !== 'Lunas') row.jumlahSantriMenunggak.add(t.santri.id);
    }

    return Array.from(perKelas.values()).map((r) => ({
      kelas: r.kelas,
      totalTagihan: r.totalTagihan,
      totalTerbayar: r.totalTerbayar,
      totalTunggakan: r.totalTunggakan,
      jumlahSantriMenunggak: r.jumlahSantriMenunggak.size,
    }));
  }

  @Get('rekap-tagihan')
  async rekap(@Query('periode') periode?: string, @Query('kelasId') kelasId?: number) {
    return this.hitungRekap(periode, kelasId);
  }

  @Get('rekap-tagihan/export')
  async export(@Query('periode') periode: string, @Query('kelasId') kelasId: number, @Res() res: Response) {
    const data = await this.hitungRekap(periode, kelasId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rekap Tagihan');
    sheet.columns = [
      { header: 'Kelas', key: 'kelas', width: 16 },
      { header: 'Total Tagihan', key: 'totalTagihan', width: 18 },
      { header: 'Total Terbayar', key: 'totalTerbayar', width: 18 },
      { header: 'Total Tunggakan', key: 'totalTunggakan', width: 18 },
      { header: 'Jumlah Santri Menunggak', key: 'jumlahSantriMenunggak', width: 22 },
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2F1' } };
    data.forEach((row) => sheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="rekap-tagihan.xlsx"');
    res.send(Buffer.from(buffer));
  }
}
