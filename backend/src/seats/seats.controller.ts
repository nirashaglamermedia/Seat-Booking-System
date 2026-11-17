
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { SeatsService } from './seats.service';

@Controller('seats')
export class SeatsController {
  constructor(
    private readonly seatsService: SeatsService,
  ) {}

  @Get()
  findAllSeats(
    @Query('row_name') row_name?: 'A' | 'B' | 'C' | 'D'| 'E' | 'F' | 'G',
  ) {
    return this.seatsService.findAllSeats(row_name);
  }

  
@Get('availability')
getSeatAvailability(
  @Query('showtime_id') showtime_id: string,
  @Query('visit_date') visit_date: string,
  @Query('exclude_booking_id') exclude_booking_id?: string,
) {
  return this.seatsService.getSeatAvailability(
    Number(showtime_id),
    visit_date,
    exclude_booking_id ? Number(exclude_booking_id) : undefined,
  );
}


   @Get(':seat_id') 
      findOneSeat(@Param('seat_id', ParseIntPipe) seat_id: number) {
          return this.seatsService.findOneSeat(seat_id);
      }
      @Post()
      createSeat(@Body() seat: any) {
          return this.seatsService.createSeat(seat);
      }
  
      @Patch(':seat_id')
      updateSeat(
          @Param('seat_id') seat_id: string,
          @Body() updateSeat: any,
          ) {
          return this.seatsService.updateSeat(Number(seat_id), updateSeat);
          }
  
      
      @Delete(':seat_id')
      deleteSeat(@Param('seat_id', ParseIntPipe) seat_id: number) {
          return this.seatsService.deleteSeat(seat_id);
      }
}
