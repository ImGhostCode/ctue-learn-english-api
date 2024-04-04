import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CONSTANTS_MAX } from 'src/global';

export class CreateSentenceDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  typeId: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  topicId: number[];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty()
  @IsString()
  @MaxLength(CONSTANTS_MAX.SENTENCE_CONTENT_LEN)
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsString()
  @MaxLength(CONSTANTS_MAX.SENTENCE_MEAN_LEN)
  @IsNotEmpty()
  meaning: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(CONSTANTS_MAX.SENTENCE_NOTE_LEN)
  note?: string;
}
