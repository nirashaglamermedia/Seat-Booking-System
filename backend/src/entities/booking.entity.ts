import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from './users.entity';
import { Showtime } from './showtime.entity';
import { BookingSeat } from './booking-seat.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  booking_id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ type: 'timestamp', nullable: true })
  booking_date: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  total: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  arrival_status: string;

  @Column({ type: 'timestamp', nullable: true })
  arrived_at: Date;

  @Column({ nullable: true })
  showtime_id: number;

  @Column({ type: 'date', nullable: true })
  visit_date: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Showtime)
  @JoinColumn({ name: 'showtime_id' })
  showtime: Showtime;

  @OneToMany(() => BookingSeat, (bookingSeat) => bookingSeat.booking)
  bookingSeats: BookingSeat[];
}