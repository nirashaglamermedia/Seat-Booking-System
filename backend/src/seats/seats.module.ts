
import { Module } from '@nestjs/common';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { SeatGateway } from '../bookings/seat.gateway';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SeatsController],
  providers: [SeatsService, SeatGateway],
  exports: [SeatGateway],
})
export class SeatsModule {}
