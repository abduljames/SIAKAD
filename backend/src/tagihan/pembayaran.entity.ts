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
  metode: 'Tunai' | 'Transfer Bank' | 'E-Wallet';

  @Column({ nullable: true })
  penyedia: string;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @CreateDateColumn()
  createdAt: Date;
}
