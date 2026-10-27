import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarkWatchedDto {
  @ApiProperty({ description: 'TMDB movie ID', example: 550 })
  @IsInt()
  @IsNotEmpty()
  tmdbId: number;

  @ApiProperty({ description: 'Movie title', example: 'Fight Club' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' })
  @IsOptional()
  @IsString()
  posterPath?: string;

  @ApiPropertyOptional({ example: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg' })
  @IsOptional()
  @IsString()
  backdropPath?: string;

  @ApiPropertyOptional({ example: '1999-10-15' })
  @IsOptional()
  @IsString()
  releaseDate?: string;

  @ApiPropertyOptional({ example: 8.4 })
  @IsOptional()
  @IsNumber()
  voteAverage?: number;

  @ApiPropertyOptional({ example: 9.0, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  userRating?: number;

  @ApiPropertyOptional({ example: '2024-05-18T12:00:00Z' })
  @IsOptional()
  @IsString()
  watchedAt?: string;
}

