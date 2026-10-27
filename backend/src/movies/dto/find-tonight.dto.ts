import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MoodOption {
  SCARY = 'scary',
  FUNNY = 'funny',
  SMART = 'smart',
  EMOTIONAL = 'emotional',
  ROMANTIC = 'romantic',
  EXCITING = 'exciting',
}

export enum RuntimeOption {
  UNDER_90 = 'under-90',
  BETWEEN_90_120 = '90-120',
  OVER_120 = 'over-120',
}

export enum EraOption {
  CLASSIC = 'classic',
  ERA_2000_2010 = '2000-2010',
  ERA_2010_2020 = '2010-2020',
  RECENT = 'recent',
}

export class FindTonightDto {
  @ApiPropertyOptional({
    enum: MoodOption,
    isArray: true,
    description: 'Array of mood preferences: scary, funny, smart, emotional, romantic, exciting',
    example: ['exciting', 'smart'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MoodOption, { each: true })
  moods?: MoodOption[];

  @ApiPropertyOptional({
    type: [Number],
    isArray: true,
    description: 'Array of direct TMDB genre IDs (e.g. 28 for Action, 12 for Adventure)',
    example: [28, 12, 878],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  genreIds?: number[];

  @ApiPropertyOptional({
    enum: RuntimeOption,
    description: 'Duration preference: under-90, 90-120, over-120',
    example: '90-120',
  })
  @IsOptional()
  @IsEnum(RuntimeOption)
  runtime?: RuntimeOption;

  @ApiPropertyOptional({
    enum: EraOption,
    description: 'Era preference: classic, 2000-2010, 2010-2020, recent',
    example: 'recent',
  })
  @IsOptional()
  @IsEnum(EraOption)
  era?: EraOption;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}

export class SurpriseMovieDto {
  @ApiPropertyOptional({
    description: 'List of TMDB IDs already viewed in this session to avoid repeats',
    example: [550, 680],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  excludedIds?: number[];

  @ApiPropertyOptional({
    enum: MoodOption,
    description: 'Optional mood filter for surprise choice',
  })
  @IsOptional()
  @IsEnum(MoodOption)
  mood?: MoodOption;

  @ApiPropertyOptional({
    type: Number,
    description: 'Optional TMDB genre ID for surprise choice (e.g. 28 for Action)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  genreId?: number;
}

