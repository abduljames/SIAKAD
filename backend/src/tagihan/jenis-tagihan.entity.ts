import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class JenisTagihan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ unique: true })
  kode: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column()
  sifat: 'Bulanan' | 'Sekali' | 'Insidental';

  // Nominal bawaan -- dipakai buat auto-isi jumlah rincian saat jenis ini
  // dipilih di form Buat Tagihan, supaya tidak perlu ketik manual tiap kali.
  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  nominalDefault: number;

  @Column({ default: 'Aktif' })
  status: 'Aktif' | 'Nonaktif';

  @Column({ default: 0 })
  urutan: number;

  @CreateDateColumn()
  createdAt: Date;
}
