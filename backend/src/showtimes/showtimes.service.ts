import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Showtime } from '../entities/showtime.entity';
import { Booking } from '../entities/booking.entity';

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,

    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  
  private async hasActiveBookings(showtime_id: number): Promise<boolean> {
    const count = await this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.bookingSeats', 'bookingSeat')
      .where('booking.showtime_id = :showtime_id', { showtime_id })
      .andWhere('booking.status = :bookingStatus', {
        bookingStatus: 'Confirmed',
      })
      .andWhere('bookingSeat.status = :seatStatus', {
        seatStatus: 'Booked',
      })
      .getCount();

    return count > 0;
  }

  // Get all showtimes
  async findAllShowTimes() {
    return this.showtimeRepository.find({
      order: {
        showtime_id: 'ASC',
      },
    });
  }

  // Get one showtime
  async findOneByShowTime(showtime_id: number) {
    const showtime = await this.showtimeRepository.findOne({
      where: { showtime_id },
    });

    if (!showtime) {
      throw new NotFoundException(
        `Showtime with ID ${showtime_id} not found`,
      );
    }

    return showtime;
  }

  // Create showtime
  async createShowtime(showtime: any) {
    const { movie_id, start_time, end_time } = showtime;

    if (!movie_id || !start_time || !end_time) {
      throw new BadRequestException(
        'Movie ID, start time and end time are required',
      );
    }

    const newShowtime = this.showtimeRepository.create({
      movie_id,
      start_time,
      end_time,
    });

    return this.showtimeRepository.save(newShowtime);
  }

  // Update showtime
  async updateShowtime(
    showtime_id: number,
    updateShowtime: any,
  ) {
    const showtime = await this.findOneByShowTime(showtime_id);

    const hasChanges =
      updateShowtime.start_time !== undefined ||
      updateShowtime.end_time !== undefined;

    if (!hasChanges) {
      return showtime;
    }

    // Prevent updating if customers have booked this showtime
    const hasBookings = await this.hasActiveBookings(showtime_id);

    if (hasBookings) {
      throw new BadRequestException(
        'Cannot update this showtime because customers have already booked tickets.',
      );
    }

    if (updateShowtime.start_time !== undefined) {
      showtime.start_time = updateShowtime.start_time;
    }

    if (updateShowtime.end_time !== undefined) {
      showtime.end_time = updateShowtime.end_time;
    }

    return this.showtimeRepository.save(showtime);
  }

  // Delete showtime
  async deleteShowtime(showtime_id: number) {
    const showtime = await this.findOneByShowTime(showtime_id);

    // Prevent deleting if customers have booked this showtime
    const hasBookings = await this.hasActiveBookings(showtime_id);

    if (hasBookings) {
      throw new BadRequestException(
        'Cannot delete this showtime because customers have already booked tickets.',
      );
    }

    await this.showtimeRepository.remove(showtime);

    return {
      message: 'Showtime deleted successfully',
      showtime,
    };
  }
}