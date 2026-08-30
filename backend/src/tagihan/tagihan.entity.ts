import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Santri } from '../santri/santri.entity';
import { TagihanDetail } from './tagihan-detail.entity';

@Entity()
export class Tagihan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  noTagihan: string;

  @ManyToOne(() => Santri, { eager: true })
  santri: Santri;

  @Column()
  periode: string;

  @Column({ type: 'date' })
  jatuhTempo: string;

  @Column({ type: 'text', nullable: true })
  referensi: string;

  @OneToMany(() => TagihanDetail, (d) => d.tagihan, { cascade: true, eager: true })
  rincian: TagihanDetail[];

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  totalTagihan: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  totalTerbayar: number;

  @Column({ default: 'Belum Bayar' })
  status: 'Belum Bayar' | 'Sebagian' | 'Lunas';

  @CreateDateColumn()
  createdAt: Date;
}
