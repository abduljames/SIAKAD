import 'dotenv/config';
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AdminUser } from './auth/admin-user.entity';
import { AuthController } from './auth/auth.controller';
import { Kelas } from './kelas/kelas.entity';
import { KelasController } from './kelas/kelas.controller';
import { Santri } from './santri/santri.entity';
import { SantriController } from './santri/santri.controller';
import { JenisTagihan } from './tagihan/jenis-tagihan.entity';
import { JenisTagihanController } from './tagihan/jenis-tagihan.controller';
import { Tagihan } from './tagihan/tagihan.entity';
import { TagihanDetail } from './tagihan/tagihan-detail.entity';
import { TagihanController } from './tagihan/tagihan.controller';
import { Pembayaran } from './tagihan/pembayaran.entity';
import { PembayaranController } from './tagihan/pembayaran.controller';
import { LaporanController } from './laporan/laporan.controller';

export const ALL_ENTITIES = [AdminUser, Kelas, Santri, JenisTagihan, Tagihan, TagihanDetail, Pembayaran];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5435,
      username: process.env.DB_USERNAME || 'siakad',
      password: process.env.DB_PASSWORD || 'siakad',
      database: process.env.DB_DATABASE || 'db_siakad',
      entities: ALL_ENTITIES,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
    JwtModule.register({}),
  ],
  controllers: [
    AuthController,
    KelasController,
    SantriController,
    JenisTagihanController,
    TagihanController,
    PembayaranController,
    LaporanController,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectRepository(AdminUser) private adminRepo: Repository<AdminUser>) {}

  // Seed satu akun Admin default kalau belum ada sama sekali -- SIAKAD v0
  // sengaja cuma punya satu akun (lihat rencana), jadi tidak ada halaman
  // registrasi. Kredensial default WAJIB diganti sebelum dipakai produksi.
  async onModuleInit() {
    const jumlah = await this.adminRepo.count();
    if (jumlah === 0) {
      const password = await bcrypt.hash('admin123', 10);
      await this.adminRepo.save(this.adminRepo.create({ username: 'admin', nama: 'Administrator', password }));
      console.log('[SIAKAD] Akun admin default dibuat -- username: admin / password: admin123 (SEGERA GANTI)');
    }
  }
}
