import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Booking } from './booking.entity';

@Entity('booking_seats')
export class BookingSeat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  booking_id: number;

  @Column({ type: 'integer', nullable: true })
  seat_id: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  ticket_price: string;

  @Column({ type: 'varchar', nullable: false })
  status: string;

  @ManyToOne(() => Booking, (booking) => booking.bookingSeats)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}