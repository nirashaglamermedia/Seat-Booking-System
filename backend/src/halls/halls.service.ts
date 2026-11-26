
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Hall } from '../entities/halls.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class HallsService {
  constructor(
    @InjectRepository(Hall)
    private hallRepository: Repository<Hall>,

    private dataSource: DataSource,
  ) {}

  async findAllHalls() {
    return this.hallRepository.find();
  }

  async findOneHall(hall_id: number) {
    return this.hallRepository.findOneBy({ hall_id });
  }

  async createHall(data: Partial<Hall>) {
    const hall = this.hallRepository.create(data);
    return this.hallRepository.save(hall);
  }

  async removeHall(hall_id: number) {
    const hall = await this.hallRepository.findOneBy({ hall_id });

    if (!hall) {
      throw new NotFoundException('Hall not found.');
    }

    // Check whether the hall has active bookings
    const result = await this.dataSource.query(
      `
      SELECT EXISTS (
        SELECT 1
        FROM showtimes st
        INNER JOIN bookings b
          ON b.showtime_id = st.showtime_id
        INNER JOIN booking_seats bs
          ON bs.booking_id = b.booking_id
        WHERE st.hall_id = $1
          AND b.status = 'Confirmed'
          AND bs.status = 'Booked'
      ) AS has_active_bookings
      `,
      [hall_id],
    );

    if (result[0].has_active_bookings) {
      throw new BadRequestException(
        'Cannot deactivate this Hall because it has active bookings. Please cancel or complete the bookings first.',
      );
    }

    // Deactivate hall without deleting it
    hall.status = 'Inactive';

    return await this.hallRepository.save(hall);
  }
}
