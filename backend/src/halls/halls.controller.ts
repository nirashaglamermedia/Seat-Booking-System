import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { HallsService } from './halls.service';
import { Hall } from '../entities/halls.entity';

@Controller('halls')
export class HallsController {
    constructor(private readonly hallService:HallsService){}

    @Get()
    findAllHalls(){
        return this.hallService.findAllHalls();
    }

    @Get(':hall_id')
    findOneHall(@Param('hall_id', ParseIntPipe) hall_id: number) {
        return this.hallService.findOneHall(hall_id);
    }

    @Post()
    createHall(@Body() data: Partial<Hall>){
        return this.hallService.createHall(data);
    }

    @Delete(':hall_id')
    removeHall(
    @Param('hall_id', ParseIntPipe) hall_id: number,
    ) {
    return this.hallService.removeHall(hall_id);
    }
    
}
