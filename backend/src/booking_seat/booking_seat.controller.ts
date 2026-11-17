import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { BookingSeatService } from './booking_seat.service';

@Controller('booking-seat')
export class BookingSeatController {

    constructor(private readonly bookingSeatService: BookingSeatService,) {}

    @Get()
    findBookingSeat() {
        return this.bookingSeatService.findAllBookingSeats();
    }
    
    @Get(':id') 
    findOneBookingSeat(@Param('id', ParseIntPipe) id: number) {
        return this.bookingSeatService.findOneBookingSeat(id);
    }
    
    @Post()
    createBookingSeat(@Body() bookingseat: any) {
        return this.bookingSeatService.createBookingSeat(bookingseat);
    }
      
    @Patch(':id')
    updateBookingSeat(@Param('id') id: string,@Body() updateBookingSeat: any,) {
        return this.bookingSeatService.updateBookingSeat(Number(id), updateBookingSeat);
    }
    
    @Delete(':id')
    deleteBookingSeat(@Param('id', ParseIntPipe) id: number) {
        return this.bookingSeatService.deleteBookingSeat(id);
    }

}
