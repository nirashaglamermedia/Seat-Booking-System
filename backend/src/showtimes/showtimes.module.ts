import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Showtime } from '../entities/showtime.entity';
import { Booking } from '../entities/booking.entity';

import { ShowtimesService } from './showtimes.service';
import { ShowtimesController } from './showtimes.controller';
import { Hall } from '../entities/halls.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Showtime,
      Booking,
      Hall
    ]),
  ],

  providers: [ShowtimesService],

  controllers: [ShowtimesController],
})
export class ShowtimesModule {}