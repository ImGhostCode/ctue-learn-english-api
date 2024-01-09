import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CONSTANTS_MAX, CONSTANTS_MIN } from '../../global';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  code: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.EMAIL_LEN)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(CONSTANTS_MIN.PASSWORD_LEN)
  newPassword: string;
}
