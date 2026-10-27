import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token (credential) obtained from Google Identity Services',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({
    description: 'Optional demo bypass payload for local development when GOOGLE_CLIENT_ID is not configured',
  })
  @IsOptional()
  demoUser?: {
    email: string;
    name: string;
    picture?: string;
  };
}

