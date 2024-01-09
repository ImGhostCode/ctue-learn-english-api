import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTopicDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isWord?: boolean;

  @ApiProperty()
  @Optional()
  @IsString()
  image?: string;
}
