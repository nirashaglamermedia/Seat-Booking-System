import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Showtime } from '../entities/showtime.entity';
import { Booking } from '../entities/booking.entity';
import { Hall } from '../entities/halls.entity';

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,

    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
   @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,
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

   private async validateHall(hall_id: number): Promise<Hall> {
    if (!Number.isInteger(hall_id) || hall_id <= 0) {
      throw new BadRequestException('Valid Hall ID is required');
    }

    const hall = await this.hallRepository.findOneBy({
      hall_id,
    });

    if (!hall) {
      throw new NotFoundException(
        `Hall with ID ${hall_id} not found`,
      );
    }

    if (hall.status !== 'Active') {
      throw new BadRequestException(
        'Cannot assign an inactive hall to a showtime',
      );
    }

    return hall;
  }

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

  
  async createShowtime(showtime: any) {
    const { movie_id,hall_id, start_time, end_time } = showtime;

    if (!movie_id || !hall_id || !start_time || !end_time) {
      throw new BadRequestException(
        'Movie ID, hall_id,start time and end time are required',
      );
    }
    await this.validateHall(Number(hall_id));
    const newShowtime = this.showtimeRepository.create({
      movie_id: Number(movie_id),
      hall_id: Number(hall_id),
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
      updateShowtime.end_time !== undefined ||
      updateShowtime.hall_id !== undefined;

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

    if (updateShowtime.hall_id !== undefined) {
      const hall_id = Number(updateShowtime.hall_id);

      await this.validateHall(hall_id);

      showtime.hall_id = hall_id;
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