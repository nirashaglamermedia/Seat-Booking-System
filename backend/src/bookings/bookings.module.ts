import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { DatabaseModule } from '../database/database.module';

import { SeatsModule } from '../seats/seats.module';
import { SeatGateway } from './seat.gateway';


@Module({
  imports: [DatabaseModule,SeatsModule],
  controllers: [BookingsController],
  providers: [BookingsService,SeatGateway]
})
export class BookingsModule {}
