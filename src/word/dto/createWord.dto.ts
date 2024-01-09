import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CONSTANTS_MAX } from '../../global';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWordDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  typeId: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  topicId: number[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  levelId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  specializationId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
  content: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.WORD_MEAN_LEN)
  mean: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(CONSTANTS_MAX.WORD_NOTE_LEN)
  note?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phonetic?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  examples?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  synonyms?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  antonyms?: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  picture?: string;
}
