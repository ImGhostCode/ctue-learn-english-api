import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ToggleBanUserDto {
  @ApiProperty()
  @Optional()
  @IsString()
  feedback?: string;
}
