import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { FindTonightDto, SurpriseMovieDto } from './dto/find-tonight.dto';
import { DiscoverMoviesDto, SearchMoviesDto } from './dto/discover-movies.dto';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('popular')
  @ApiOperation({ summary: 'Get current popular movies' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getPopular(@Query('page') page?: number) {
    return this.moviesService.getPopular(page ? Number(page) : 1);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending movies (daily or weekly)' })
  @ApiQuery({ name: 'timeWindow', required: false, enum: ['day', 'week'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getTrending(
    @Query('timeWindow') timeWindow?: 'day' | 'week',
    @Query('page') page?: number,
  ) {
    return this.moviesService.getTrending(timeWindow || 'day', page ? Number(page) : 1);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated movies' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getTopRated(@Query('page') page?: number) {
    return this.moviesService.getTopRated(page ? Number(page) : 1);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming movie releases' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getUpcoming(@Query('page') page?: number) {
    return this.moviesService.getUpcoming(page ? Number(page) : 1);
  }

  @Get('genres')
  @ApiOperation({ summary: 'Get official TMDB movie genre list' })
  getGenres() {
    return this.moviesService.getGenres();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search movies by title query' })
  searchMovies(@Query() queryDto: SearchMoviesDto) {
    return this.moviesService.searchMovies(queryDto.query, queryDto.page ? Number(queryDto.page) : 1);
  }

  @Get('discover')
  @ApiOperation({ summary: 'Discover movies with genre, year, and sorting filters' })
  discoverMovies(@Query() discoverDto: DiscoverMoviesDto) {
    return this.moviesService.discoverMovies(discoverDto);
  }

  @Post('find-for-tonight')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Discover movies tailored to mood, duration, and era preferences' })
  findForTonight(@Body() dto: FindTonightDto) {
    return this.moviesService.findForTonight(dto);
  }

  @Post('surprise')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Surprise Me: pick a high-rated random movie with trailer' })
  surpriseMe(@Body() dto: SurpriseMovieDto) {
    return this.moviesService.surpriseMe(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed movie metadata by TMDB ID' })
  getMovieDetails(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieDetails(id);
  }

  @Get(':id/credits')
  @ApiOperation({ summary: 'Get movie cast and crew' })
  getMovieCredits(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieCredits(id);
  }

  @Get(':id/videos')
  @ApiOperation({ summary: 'Get trailers and video links' })
  getMovieVideos(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieVideos(id);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Get similar movies' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getSimilar(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
  ) {
    return this.moviesService.getSimilarMovies(id, page ? Number(page) : 1);
  }

  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get recommended movies' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getRecommendations(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
  ) {
    return this.moviesService.getRecommendedMovies(id, page ? Number(page) : 1);
  }
}

