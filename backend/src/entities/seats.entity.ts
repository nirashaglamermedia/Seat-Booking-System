
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne, JoinColumn
} from 'typeorm';


import { Hall } from './halls.entity';

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn()
  seat_id: number;

  @Column({ type: 'integer' })
  hall_id: number;

  @Column({ type: 'varchar', length: 1 })
  row_name: string;

  @Column({ type: 'integer' })
  seat_number: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  price: string;

  @ManyToOne(() => Hall, (hall) => hall.seats)
  @JoinColumn({ name: 'hall_id' })
  hall: Hall;
}
