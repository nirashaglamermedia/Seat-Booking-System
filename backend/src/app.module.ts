import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';

import { UsersModule } from './users/users.module';
import { SeatsModule } from './seats/seats.module';
import { BookingsModule } from './bookings/bookings.module';
import { BookingSeatModule } from './booking_seat/booking_seat.module';
import { AuthModule } from './auth/auth.module';
import { CouponsModule } from './coupons/coupons.module';
import { MembershipsModule } from './memberships/memberships.module';
import { MoviesModule } from './movies/movies.module';
import { ShowtimesModule } from './showtimes/showtimes.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    SeatsModule,
    BookingsModule,
    BookingSeatModule,
    AuthModule,
    CouponsModule,
    MembershipsModule,
    MoviesModule,
    ShowtimesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}