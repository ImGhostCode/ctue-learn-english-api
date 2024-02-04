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


class WordMeaning {
  @ApiProperty()
  @IsNumber()
  typeId: number

  @ApiProperty()
  @IsString()
  @MaxLength(CONSTANTS_MAX.WORD_MEAN_LEN)
  @IsNotEmpty()
  meaning: string
}

export class UpdateWordDto {
  // @ApiProperty()
  // @IsOptional()
  // @IsNumber()
  // practiceId?: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  // @Transform((params: TransformFnParams) => {
  //     return params.value.map(item => parseInt(item, 10));
  // })
  // @IsNumber({}, { each: true })
  topicId: number[];

  @ApiProperty()
  // @IsOptional()
  @IsNumber()
  levelId?: number;

  @ApiProperty()
  // @IsOptional()
  @IsNumber()
  specializationId?: number;

  @ApiProperty()
  // @IsOptional()
  @IsString()
  @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
  content?: string;

  @ApiProperty({ type: () => WordMeaning, isArray: true })
  @IsOptional()
  @Type(() => WordMeaning)
  meanings: WordMeaning[];

  @ApiProperty()
  // @IsOptional()
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

  @ApiProperty()
  @IsOptional()
  @IsArray()
  oldPictures?: string[];

  @ApiProperty({ name: 'new_pictures', type: 'array', items: { type: 'string', format: 'binary', } })
  @IsOptional()
  @IsArray()
  newPictures?: string[];
}
