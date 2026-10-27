import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DiscoverMoviesDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Comma separated genre IDs, e.g. "28,12"' })
  @IsOptional()
  @IsString()
  with_genres?: string;

  @ApiPropertyOptional({ description: 'Release year, e.g. "2023"' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1890)
  @Max(2050)
  primary_release_year?: number;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'popularity.desc',
    enum: [
      'popularity.desc',
      'popularity.asc',
      'vote_average.desc',
      'vote_average.asc',
      'primary_release_date.desc',
      'primary_release_date.asc',
    ],
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'popularity.desc';
}

export class SearchMoviesDto {
  @ApiPropertyOptional({ description: 'Movie search query string' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}

