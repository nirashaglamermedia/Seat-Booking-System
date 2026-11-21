import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Movie } from '../entities/movies.entity';
import { Booking } from '../entities/booking.entity';
import { Showtime } from '../entities/showtime.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    private readonly dataSource: DataSource,
  ) {}

  
  private async hasActiveBookings(movie_id: number): Promise<boolean> {
    const count = await this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.showtime', 'showtime')
      .innerJoin('booking.bookingSeats', 'bookingSeat')
      .where('showtime.movie_id = :movie_id', { movie_id })
      .andWhere('booking.status = :bookingStatus', {
        bookingStatus: 'Confirmed',
      })
      .andWhere('bookingSeat.status = :seatStatus', {
        seatStatus: 'Booked',
      })
      .getCount();

    return count > 0;
  }

  
  
  async findAllMovies() {
    const results = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoin('movie.showtimes', 'showtime')
      .select('movie.movie_id', 'movie_id')
      .addSelect('movie.movie_name', 'movie_name')
      .addSelect('movie.description', 'description')
      .addSelect('movie.duration_minutes', 'duration_minutes')
      .addSelect('movie.poster_url', 'poster_url')
      .addSelect('movie.status', 'status')
      .addSelect('showtime.showtime_id', 'showtime_id')
      .addSelect('showtime.start_time', 'start_time')
      .addSelect('showtime.end_time', 'end_time')
      .orderBy('movie.movie_id', 'ASC')
      .addOrderBy('showtime.start_time', 'ASC')
      .getRawMany();

    const groupedMovies = new Map();

    for (const row of results) {
      if (!groupedMovies.has(row.movie_id)) {
        groupedMovies.set(row.movie_id, {
          movie_id: row.movie_id,
          movie_name: row.movie_name,
          description: row.description,
          duration_minutes: row.duration_minutes,
          poster_url: row.poster_url,
          status: row.status,
          showtimes: [],
        });
      }

      if (row.showtime_id !== null) {
        groupedMovies.get(row.movie_id).showtimes.push({
          showtime_id: row.showtime_id,
          start_time: row.start_time,
          end_time: row.end_time,
        });
      }
    }

    return Array.from(groupedMovies.values());
  }
  
  async findOneByMovie(movie_id: number) {
    const movie = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoin('movie.showtimes', 'showtime')
      .select('movie.movie_id', 'movie_id')
      .addSelect('movie.movie_name', 'movie_name')
      .addSelect('movie.description', 'description')
      .addSelect('movie.duration_minutes', 'duration_minutes')
      .addSelect('movie.status', 'status')
      .addSelect('showtime.showtime_id', 'showtime_id')
      .addSelect('showtime.start_time', 'start_time')
      .addSelect('showtime.end_time', 'end_time')
      .where('movie.movie_id = :movie_id', { movie_id })
      .orderBy('showtime.start_time', 'ASC', 'NULLS LAST')
      .getRawOne();

    if (!movie) {
      throw new NotFoundException(`Movie ${movie_id} not found`);
    }

    return movie;
  }

  // Find an active movie by name
  // Find an active movie by name with all showtimes

async findMovieByName(movieName: string) {
  const results = await this.movieRepository
    .createQueryBuilder('movie')
    .leftJoin('movie.showtimes', 'showtime')

    // Join halls table using hall_id
    .leftJoin(
      'halls',
      'hall',
      'hall.hall_id = showtime.hall_id',
    )

    .select('movie.movie_id', 'movie_id')
    .addSelect('movie.movie_name', 'movie_name')
    .addSelect('movie.description', 'description')
    .addSelect('movie.duration_minutes', 'duration_minutes')
    .addSelect('movie.poster_url', 'poster_url')
    .addSelect('movie.status', 'status')

    .addSelect('showtime.showtime_id', 'showtime_id')
    .addSelect('showtime.start_time', 'start_time')
    .addSelect('showtime.end_time', 'end_time')

    .addSelect('hall.hall_name', 'hall_name')

    .where('movie.movie_name = :movieName', { movieName })
    .andWhere('movie.status = :status', { status: 'Active' })

    .orderBy('showtime.start_time', 'ASC')
    .getRawMany();

  if (results.length === 0) {
    throw new NotFoundException(
      `Movie ${movieName} not found`,
    );
  }

  return {
    movie_id: results[0].movie_id,
    movie_name: results[0].movie_name,
    description: results[0].description,
    duration_minutes: results[0].duration_minutes,
    poster_url: results[0].poster_url,
    status: results[0].status,

    showtimes: results
      .filter((row) => row.showtime_id !== null)
      .map((row) => ({
        showtime_id: row.showtime_id,
        start_time: row.start_time,
        end_time: row.end_time,
        hall_name: row.hall_name,
      })),
  };
}


  // Create a movie
  async createMovie(movie: any) {
    const { movie_name, description, duration_minutes } = movie;

    const newMovie = this.movieRepository.create({
      movie_name,
      description,
      duration_minutes,
    });

    return this.movieRepository.save(newMovie);
  }

  // Create a movie and its showtime together
  async createMovieWithShowtime(data: any) {
    if (
      !data.movie_name ||
      !data.description ||
      !data.duration_minutes ||
      !data.poster_url ||
      !data.start_time ||
      !data.end_time
    ) {
      throw new BadRequestException(
        'Movie name, description, duration, poster, start time and end time are required',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const movieRepository = manager.getRepository(Movie);
      const showtimeRepository = manager.getRepository(Showtime);

      // Create movie
      const newMovie = movieRepository.create({
        movie_name: data.movie_name,
        description: data.description,
        duration_minutes: data.duration_minutes,
        poster_url: data.poster_url,
      });

      const savedMovie = await movieRepository.save(newMovie);

      // Create showtime using the generated movie_id
      const newShowtime = showtimeRepository.create({
        movie_id: savedMovie.movie_id,
        start_time: data.start_time,
        end_time: data.end_time,
      });

      const savedShowtime = await showtimeRepository.save(newShowtime);

      return {
        message: 'Movie and Showtime created successfully',
        movie: savedMovie,
        showtime: savedShowtime,
      };
    });
  }

  // Update a movie
  async updateMovie(movie_id: number, updateMovie: any) {
    const movie = await this.movieRepository.findOne({
      where: { movie_id },
    });

    if (!movie) {
      throw new NotFoundException(
        `Movie with ID ${movie_id} not found`,
      );
    }

    // Prevent changing duration if customers have booked this movie
    if (updateMovie.duration_minutes !== undefined) {
      const hasBookings = await this.hasActiveBookings(movie_id);

      if (hasBookings) {
        throw new BadRequestException(
          'Cannot change movie duration because customers have already booked this movie.',
        );
      }
    }

    // Update only the fields allowed by the existing API
    if (updateMovie.movie_name !== undefined) {
      movie.movie_name = updateMovie.movie_name;
    }

    if (updateMovie.description !== undefined) {
      movie.description = updateMovie.description;
    }

    if (updateMovie.duration_minutes !== undefined) {
      movie.duration_minutes = updateMovie.duration_minutes;
    }

    if (updateMovie.poster_url !== undefined) {
      movie.poster_url = updateMovie.poster_url;
    }

    if (updateMovie.status !== undefined) {
      movie.status = updateMovie.status;
    }

    return this.movieRepository.save(movie);
  }

  // Soft delete a movie
  async deleteMovie(movie_id: number) {
    const movie = await this.movieRepository.findOne({
      where: { movie_id },
    });

    if (!movie) {
      throw new NotFoundException(
        `Movie with ID ${movie_id} not found`,
      );
    }

    const hasBookings = await this.hasActiveBookings(movie_id);

    if (hasBookings) {
      throw new BadRequestException(
        'Cannot delete this movie because customers have already booked tickets.',
      );
    }

    movie.status = 'Inactive';

    return this.movieRepository.save(movie);
  }
}