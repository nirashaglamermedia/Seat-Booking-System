
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';

import { ShowtimesService } from './showtimes.service';

@Controller('showtimes')
export class ShowtimesController {
  constructor(
    private readonly showtimesService: ShowtimesService,
  ) {}

  @Get()
  findAllShowtimes() {
    return this.showtimesService.findAllShowTimes();
  }

  @Get(':showtime_id')
  findOneByShowtime(
    @Param('showtime_id', ParseIntPipe)
    showtime_id: number,
  ) {
    return this.showtimesService.findOneByShowTime(showtime_id);
  }

  @Post()
  createShowtime(@Body() showtime: any) {
    return this.showtimesService.createShowtime(showtime);
  }

  @Patch(':showtime_id')
  updateShowtime(
    @Param('showtime_id', ParseIntPipe)
    showtime_id: number,
    @Body() updateShowtime: any,
  ) {
    return this.showtimesService.updateShowtime(
      showtime_id,
      updateShowtime,
    );
  }

  @Delete(':showtime_id')
  deleteShowtime(
    @Param('showtime_id', ParseIntPipe)
    showtime_id: number,
  ) {
    return this.showtimesService.deleteShowtime(showtime_id);
  }
}
