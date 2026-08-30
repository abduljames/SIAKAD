import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Santri } from './santri.entity';
import { Kelas } from '../kelas/kelas.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const SANTRI_KOLOM_IMPORT = [
  { header: 'Nama*', key: 'nama' },
  { header: 'NIS*', key: 'nis' },
  { header: 'Kelas*', key: 'kelas' },
  { header: 'Jenis Kelamin (L/Laki-laki atau P/Perempuan)', key: 'jenis kelamin' },
  { header: 'Tanggal Lahir (YYYY-MM-DD atau DD-MM-YYYY)', key: 'tanggal lahir' },
  { header: 'Nama Wali', key: 'nama wali' },
  { header: 'No. HP Wali', key: 'no hp wali' },
  { header: 'Alamat', key: 'alamat' },
];

// Pola sama seperti backend/src/santri.controller.ts di ProyekKoperasi --
// terima singkatan L/P dan dua format tanggal, biar staf tata usaha tidak
// perlu ubah format Excel yang biasa mereka pakai.
function normalisasiJenisKelamin(v: any): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toLowerCase();
  if (['l', 'laki', 'laki-laki', 'laki laki', 'pria'].includes(s)) return 'Laki-laki';
  if (['p', 'perempuan', 'wanita'].includes(s)) return 'Perempuan';
  return String(v).trim();
}

function normalizeHeader(raw: any): string {
  return String(raw ?? '')
    .split('(')[0]
    .replace(/\*/g, '')
    .trim()
    .toLowerCase();
}

function parseTanggal(v: any): string | null {
  if (!v) return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

@Controller('santri')
@UseGuards(JwtAuthGuard)
export class SantriController {
  constructor(
    @InjectRepository(Santri) private santriRepo: Repository<Santri>,
    @InjectRepository(Kelas) private kelasRepo: Repository<Kelas>,
  ) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('kelasId') kelasId?: number) {
    const where: any = {};
    if (search) where.nama = ILike(`%${search}%`);
    if (kelasId) where.kelas = { id: kelasId };
    return this.santriRepo.find({ where, order: { nama: 'ASC' } });
  }

  @Post()
  async create(@Body() body: Partial<Santri> & { kelasId?: number }) {
    const kelas = body.kelasId ? await this.kelasRepo.findOneBy({ id: body.kelasId }) : null;
    return this.santriRepo.save(this.santriRepo.create({ ...body, kelas }));
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: Partial<Santri> & { kelasId?: number }) {
    const kelas = body.kelasId ? await this.kelasRepo.findOneBy({ id: body.kelasId }) : undefined;
    await this.santriRepo.update(id, { ...body, ...(kelas !== undefined ? { kelas } : {}) });
    return this.santriRepo.findOneBy({ id });
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.santriRepo.delete(id);
    return { status: true };
  }

  @Get('template/download')
  async downloadTemplate() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Santri');
    sheet.columns = SANTRI_KOLOM_IMPORT.map((k) => ({ header: k.header, key: k.key, width: 20 }));
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2F1' } };
    sheet.addRow({
      nama: 'Contoh: Ahmad Fauzan',
      nis: '240101',
      kelas: '7A',
      'jenis kelamin': 'Laki-laki',
      'tanggal lahir': '2012-05-17',
      'nama wali': 'Bapak Muhammad Fauzan',
      'no hp wali': '081234567890',
      alamat: '',
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return { filename: 'template-santri-siakad.xlsx', base64: Buffer.from(buffer).toString('base64') };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File Excel wajib diupload.');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('File Excel tidak punya sheet data.');

    const colMap: Record<string, number> = {};
    sheet.getRow(1).eachCell((cell, colNumber) => {
      const key = normalizeHeader(cell.value);
      if (key) colMap[key] = colNumber;
    });

    const getVal = (row: ExcelJS.Row, key: string) => {
      const col = colMap[key];
      if (!col) return undefined;
      const v = row.getCell(col).value;
      if (v === null || v === undefined) return undefined;
      return v;
    };

    const kelasCache = new Map<string, Kelas>();
    const hasil: { baris: number; nama: string; status: string; pesan?: string }[] = [];

    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const nama = getVal(row, 'nama') ? String(getVal(row, 'nama')).trim() : '';
      if (!nama) continue;

      try {
        const nis = getVal(row, 'nis') ? String(getVal(row, 'nis')).trim() : '';
        if (!nis) throw new Error('NIS wajib diisi');

        const sudahAda = await this.santriRepo.findOneBy({ nis });
        if (sudahAda) throw new Error(`NIS ${nis} sudah terdaftar`);

        const namaKelas = getVal(row, 'kelas') ? String(getVal(row, 'kelas')).trim() : '';
        let kelas: Kelas | null = null;
        if (namaKelas) {
          kelas = kelasCache.get(namaKelas) || (await this.kelasRepo.findOneBy({ nama: namaKelas })) || null;
          if (!kelas) {
            kelas = await this.kelasRepo.save(this.kelasRepo.create({ nama: namaKelas }));
          }
          kelasCache.set(namaKelas, kelas);
        }

        const santri = this.santriRepo.create({
          nama,
          nis,
          kelas,
          jenisKelamin: normalisasiJenisKelamin(getVal(row, 'jenis kelamin')),
          tanggalLahir: parseTanggal(getVal(row, 'tanggal lahir')),
          namaWali: getVal(row, 'nama wali') ? String(getVal(row, 'nama wali')) : undefined,
          noHpWali: getVal(row, 'no hp wali') ? String(getVal(row, 'no hp wali')) : undefined,
          alamat: getVal(row, 'alamat') ? String(getVal(row, 'alamat')) : undefined,
          status: 'Aktif',
        });
        await this.santriRepo.save(santri);
        hasil.push({ baris: r, nama, status: 'Berhasil' });
      } catch (err: any) {
        hasil.push({ baris: r, nama, status: 'Gagal', pesan: err.message });
      }
    }

    return {
      total: hasil.length,
      berhasil: hasil.filter((h) => h.status === 'Berhasil').length,
      gagal: hasil.filter((h) => h.status === 'Gagal').length,
      detail: hasil,
    };
  }
}
