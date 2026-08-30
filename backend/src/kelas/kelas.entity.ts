import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Kelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nama: string;

  @Column({ nullable: true })
  tingkat: string;

  @CreateDateColumn()
  createdAt: Date;
}
