import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HallsService } from './halls.service';

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
    
}
