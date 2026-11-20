
import { Module } from '@nestjs/common';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { SeatGateway } from '../bookings/seat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from '../entities/seats.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Seat])],
  controllers: [SeatsController],
  providers: [SeatsService, SeatGateway],
  exports: [SeatGateway],
})
export class SeatsModule {}
