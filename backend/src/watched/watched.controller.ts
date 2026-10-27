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
import { WatchedService } from './watched.service';
import { MarkWatchedDto } from './dto/mark-watched.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('watched')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('watched')
export class WatchedController {
  constructor(private readonly watchedService: WatchedService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user watched history' })
  getWatched(@CurrentUser('id') userId: string) {
    return this.watchedService.getWatched(userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Mark movie as watched (automatically removes from watchlist if present)',
  })
  markAsWatched(
    @CurrentUser('id') userId: string,
    @Body() dto: MarkWatchedDto,
  ) {
    return this.watchedService.markAsWatched(userId, dto);
  }

  @Delete(':tmdbId')
  @ApiOperation({ summary: 'Remove a movie from watched history' })
  removeFromWatched(
    @CurrentUser('id') userId: string,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ) {
    return this.watchedService.removeFromWatched(userId, tmdbId);
  }

  @Post('move-to-watchlist/:tmdbId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move movie from watched collection back to watchlist' })
  moveToWatchlist(
    @CurrentUser('id') userId: string,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ) {
    return this.watchedService.moveToWatchlist(userId, tmdbId);
  }

  @Get('check/:tmdbId')
  @ApiOperation({ summary: 'Check if movie has been watched by user' })
  checkWatched(
    @CurrentUser('id') userId: string,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ) {
    return this.watchedService.isMovieWatched(userId, tmdbId);
  }
}

