
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { SeatsModule } from './seats/seats.module';
import { BookingsModule } from './bookings/bookings.module';
import { BookingSeatModule } from './booking_seat/booking_seat.module';
import { AuthModule } from './auth/auth.module';
import { CouponsModule } from './coupons/coupons.module';
import { MembershipsModule } from './memberships/memberships.module';
import { MoviesModule } from './movies/movies.module';
import { ShowtimesModule } from './showtimes/showtimes.module';
import { HallsModule } from './halls/halls.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'seat_booking',

      autoLoadEntities: true,
      synchronize: false,
    }),

    UsersModule,
    SeatsModule,
    BookingsModule,
    BookingSeatModule,
    AuthModule,
    CouponsModule,
    MembershipsModule,
    MoviesModule,
    ShowtimesModule,
    HallsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
