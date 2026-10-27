import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';
import { AddWatchlistDto } from './dto/add-watchlist.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('watchlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user watchlist' })
  getWatchlist(@CurrentUser('id') userId: string) {
    return this.watchlistService.getWatchlist(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a movie to watchlist' })
  addToWatchlist(
    @CurrentUser('id') userId: string,
    @Body() dto: AddWatchlistDto,
  ) {
    return this.watchlistService.addToWatchlist(userId, dto);
  }

  @Delete(':tmdbId')
  @ApiOperation({ summary: 'Remove a movie from watchlist' })
  removeFromWatchlist(
    @CurrentUser('id') userId: string,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ) {
    return this.watchlistService.removeFromWatchlist(userId, tmdbId);
  }

  @Get('check/:tmdbId')
  @ApiOperation({ summary: 'Check if a movie is in user watchlist' })
  checkWatchlist(
    @CurrentUser('id') userId: string,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ) {
    return this.watchlistService.isMovieInWatchlist(userId, tmdbId);
  }
}

