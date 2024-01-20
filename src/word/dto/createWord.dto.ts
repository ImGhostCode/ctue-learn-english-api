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

class WordMean {
  @ApiProperty()
  @IsNumber()
  wordId: number

  @ApiProperty()
  @IsNumber()
  typeId: number

  @ApiProperty()
  @IsString()
  @MaxLength(CONSTANTS_MAX.WORD_NOTE_LEN)
  @IsNotEmpty()
  meaning: string
}

export class CreateWordDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  userId?: number;

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

  @ApiProperty({ type: () => WordMean, isArray: true })
  @Type(() => WordMean)
  means: WordMean[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(CONSTANTS_MAX.WORD_NOTE_LEN)
  note?: string;

  @ApiProperty()
  // @IsOptional()
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

  @ApiProperty({ name: 'pictures', type: 'array', items: { type: 'string', format: 'binary', } })
  @IsOptional()
  @IsString()
  pictures?: string[];
}
