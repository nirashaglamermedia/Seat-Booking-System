import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {

    constructor(
        private readonly bookingsService: BookingsService,
      ) {}
    
        @Get()
        findAllBookings() {
            return this.bookingsService.findAllBookings();
        }
        
        @Get('user/:user_id')
        findBookingsByUserId(
        @Param('user_id', ParseIntPipe) user_id: number,
        ) {
        return this.bookingsService.findBookingsByUserId(user_id);
        }

       @Get(':booking_id') 
          findOneSeat(@Param('booking_id', ParseIntPipe) booking_id: number) {
              return this.bookingsService.findOneBooking(booking_id);
          }
          @Post()
        createBooking(@Body() booking: any) {
        return this.bookingsService.createBooking(booking);
        }

        @Patch(':booking_id/arrival')
        confirmArrival(
        @Param('booking_id', ParseIntPipe) booking_id: number,
        @Body() body: any,
        ) {
        return this.bookingsService.confirmArrival(
            booking_id,
            Number(body.user_id),
        );
        }
      
          @Patch(':booking_id')
          updateBooking(
              @Param('booking_id') booking_id: string,
              @Body() updateBooking: any,
              ) {
              return this.bookingsService.updateBooking(Number(booking_id), updateBooking);
              }
        @Patch(':booking_id/seats/:booking_seat_id/cancel')
        cancelBookingSeat(
        @Param('booking_id', ParseIntPipe) booking_id: number,
        @Param('booking_seat_id', ParseIntPipe) booking_seat_id: number,
        ) {
        return this.bookingsService.cancelBookingSeat(
            booking_id,
            booking_seat_id,
        );
        }
          
          @Delete(':booking_id')
          deleteBooking(@Param('booking_id', ParseIntPipe) booking_id: number) {
              return this.bookingsService.deleteBooking(booking_id);
          }
}
