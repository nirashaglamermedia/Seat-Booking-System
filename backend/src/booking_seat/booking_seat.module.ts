import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingSeat } from './booking-seat.entity';
import { BookingSeatService } from './booking_seat.service';
import { BookingSeatController } from './booking_seat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingSeat]),
  ],
  providers: [BookingSeatService],
  controllers: [BookingSeatController],
})
export class BookingSeatModule {}