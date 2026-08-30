import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tagihan } from './tagihan.entity';
import { JenisTagihan } from './jenis-tagihan.entity';

@Entity()
export class TagihanDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tagihan, (t) => t.rincian, { onDelete: 'CASCADE' })
  tagihan: Tagihan;

  @ManyToOne(() => JenisTagihan, { eager: true })
  jenisTagihan: JenisTagihan;

  @Column({ nullable: true })
  keterangan: string;

  @Column('decimal', { precision: 14, scale: 2 })
  jumlah: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  diskon: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  denda: number;

  @Column('decimal', { precision: 14, scale: 2 })
  total: number;
}
