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

  @Column({ default: 'Aktif' })
  status: 'Aktif' | 'Nonaktif';

  @Column({ default: 0 })
  urutan: number;

  @CreateDateColumn()
  createdAt: Date;
}
