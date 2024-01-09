import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CONSTANTS_MAX } from '../../global';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSentenceDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  typeId?: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  topicId?: number[];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  practiceId?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(CONSTANTS_MAX.SENTENCE_CONTENT_LEN)
  content?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(CONSTANTS_MAX.SENTENCE_MEAN_LEN)
  mean?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(CONSTANTS_MAX.SENTENCE_NOTE_LEN)
  note?: string;
}
