import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Movie } from '../entities/movies.entity';
import { Hall } from './halls.entity';

@Entity('showtimes')
export class Showtime {
  @PrimaryGeneratedColumn()
  showtime_id: number;

  @Column()
  movie_id: number;

  @Column({ type: 'integer' })
  hall_id: number;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @ManyToOne(() => Movie, (movie) => movie.showtimes)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Hall)
    @JoinColumn({ name: 'hall_id' })
    hall: Hall;
}
