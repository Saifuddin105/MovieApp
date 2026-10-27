import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'alex@example.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @ApiProperty({ example: 'SecretP@ssw0rd123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

