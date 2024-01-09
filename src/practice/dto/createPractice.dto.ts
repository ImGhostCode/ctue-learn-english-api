import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePraticeDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  typeId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  levelId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  specializationId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  nRight: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  nWrong: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  nRightConsecutive: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  numOfSentence: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  words: [];
}
