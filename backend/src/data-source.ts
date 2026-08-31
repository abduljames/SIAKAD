import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ALL_ENTITIES } from './app.module';

// Dipakai TypeORM CLI (migration:generate / migration:run / migration:revert)
// -- TERPISAH dari TypeOrmModule.forRoot() di app.module.ts karena CLI butuh
// DataSource polos, bukan dibungkus lewat DI Nest. Kredensial diambil dari
// .env yang sedang aktif di shell saat perintah dijalankan: pakai .env biasa
// buat migration:generate lokal, atau env production kalau migration:run
// dijalankan di server production. Pola sama persis dengan project Koperasi.
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ALL_ENTITIES,
  // Glob relatif ke __dirname (bukan path string polos) supaya cocok baik
  // dijalankan via ts-node dari src/ (dev, migration:generate/run lokal)
  // MAUPUN dari dist/ hasil kompilasi (production -- image Docker tidak
  // bawa source .ts atau ts-node sama sekali, lihat migration:run:prod).
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
