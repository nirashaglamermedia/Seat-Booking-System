import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Seat } from './seats.entity';
import { Showtime } from './showtime.entity';

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

  // One Hall has many Seats
  @OneToMany(() => Seat, (seat) => seat.hall)
  seats: Seat[];

  // One Hall has many Showtimes
  @OneToMany(() => Showtime, (showtime) => showtime.hall)
  showtimes: Showtime[];
}