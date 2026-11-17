
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { Showtime } from './../showtimes/showtime.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  movie_id: number;

  @Column()
  movie_name: string;

  @Column()
  description: string;

  @Column()
  duration_minutes: number;

  @Column({ nullable: true })
  poster_url: string;

  @Column({ default: 'Active' })
  status: string;

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes: Showtime[];
}
