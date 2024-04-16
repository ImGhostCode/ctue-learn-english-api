import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { CONSTANTS_MAX } from '../../global';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(CONSTANTS_MAX.NAME_LEN)
  name?: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  interestTopics?: number[];
}
