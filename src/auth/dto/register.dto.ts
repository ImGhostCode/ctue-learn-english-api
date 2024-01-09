import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CONSTANTS_MAX, CONSTANTS_MIN } from '../../global';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.EMAIL_LEN)
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(CONSTANTS_MAX.NAME_LEN)
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(CONSTANTS_MIN.PASSWORD_LEN)
  @IsNotEmpty()
  password: string;
}
