
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

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
}
