
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('halls')
export class Hall {
  @PrimaryGeneratedColumn()
  hall_id: number;

  @Column({ unique: true, length: 100 })
  hall_name: string;

  @Column()
  total_rows: number;

  @Column()
  seats_per_row: number;

  @Column({ default: 'Active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
