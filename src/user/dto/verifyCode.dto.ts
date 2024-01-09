import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { CONSTANTS_MAX } from '../../global';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.EMAIL_LEN)
  email: string;
}
