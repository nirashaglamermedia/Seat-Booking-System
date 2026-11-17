import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService:MoviesService){}

    @Get()
    findAllMovies(){
        return this.moviesService.findAllMovies();
    }

    @Get(':movie_id')
    findOneByMovie(
        @Param('movie_id', ParseIntPipe) movie_id: number
    ) {
        return this.moviesService.findOneByMovie(movie_id);
    }

    @Get('name/:movie_name')
    findOneByMovieName(
        @Param('movie_name') movie_name: string
    ) {
        return this.moviesService.findMovieByName(movie_name);
    }
    @Post()
    createMovie(@Body() movie: any) {
        return this.moviesService.createMovie(movie);
    }

    @Post('with-showtime')
    createMovieWithShowtime(@Body() data: any) {
        return this.moviesService.createMovieWithShowtime(data);
    }
    @Patch(':movie_id')
    updateMovie(
        @Param('movie_id', ParseIntPipe) movie_id: number,
        @Body() updateMovie: any
    ) {
        return this.moviesService.updateMovie(movie_id, updateMovie);
    }

    @Patch('deactivate/:movie_id')
    deactivateMovie(@Param('movie_id') movie_id: string) {
        return this.moviesService.deleteMovie(Number(movie_id));
    }


    
    

}
