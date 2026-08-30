import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Kelas } from '../kelas/kelas.entity';

@Entity()
export class Santri {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nis: string;

  @Column()
  nama: string;

  @ManyToOne(() => Kelas, { eager: true, nullable: true })
  kelas: Kelas | null;

  @Column({ nullable: true })
  jenisKelamin: string;

  @Column({ type: 'date', nullable: true })
  tanggalLahir: string | null;

  @Column({ nullable: true })
  namaWali: string;

  @Column({ nullable: true })
  noHpWali: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ default: 'Aktif' })
  status: 'Aktif' | 'Nonaktif';

  @CreateDateColumn()
  createdAt: Date;
}
