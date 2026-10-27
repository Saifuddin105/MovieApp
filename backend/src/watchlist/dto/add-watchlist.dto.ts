import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddWatchlistDto {
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
}

