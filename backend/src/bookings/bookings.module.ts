
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { SeatsModule } from '../seats/seats.module';
import { SeatGateway } from './seat.gateway';
import { Booking } from '../entities/booking.entity';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    SeatsModule,
    DatabaseModule,
  ],

  controllers: [BookingsController],

  providers: [
    BookingsService,
    SeatGateway,
  ],
})
export class BookingsModule {}
