import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tagihan } from './tagihan.entity';

@Entity()
export class Pembayaran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  noPembayaran: string;

  @ManyToOne(() => Tagihan, { eager: true })
  tagihan: Tagihan;

  @Column({ type: 'date' })
  tanggalBayar: string;

  @Column('decimal', { precision: 14, scale: 2 })
  jumlahBayar: number;

  @Column()
  metode: 'Tunai' | 'Transfer';

  // Detail pengirim & penerima -- HANYA diisi kalau metode = 'Transfer'. Sengaja
  // dipisah jenis+penyedia per pihak (bukan satu field "metode" gabungan) karena
  // pengirim & penerima bisa beda jenis (mis. pengirim pakai Bank, uangnya masuk
  // ke E-Wallet pesantren, atau sebaliknya).
  @Column({ type: 'varchar', nullable: true })
  jenisPengirim: 'Bank' | 'E-Wallet' | null;

  @Column({ type: 'varchar', nullable: true })
  penyediaPengirim: string | null;

  @Column({ type: 'varchar', nullable: true })
  atasNamaPengirim: string | null;

  @Column({ type: 'varchar', nullable: true })
  jenisPenerima: 'Bank' | 'E-Wallet' | null;

  @Column({ type: 'varchar', nullable: true })
  penyediaPenerima: string | null;

  @Column({ type: 'varchar', nullable: true })
  atasNamaPenerima: string | null;

  @Column({ type: 'text', nullable: true })
  catatan: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
