import {
  IsArray,
  IsJSON,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { CONSTANTS_MAX } from 'src/global';
import { ApiProperty } from '@nestjs/swagger';

class WordMean {
  // @ApiProperty()
  // @IsNumber()
  // wordId: number

  @ApiProperty()
  @IsNumber()
  typeId: number


  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.WORD_MEAN_LEN)
  meaning: string
}


class Content {

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @Transform((params: TransformFnParams) => {
    return params.value.map((item) => parseInt(item, 10));
  })
  @IsNumber({}, { each: true })
  topicId?: number[];

  @ApiProperty()
  // @IsOptional()
  @IsNumber()
  levelId?: number;

  @ApiProperty()
  // @IsOptional()
  @IsNumber()
  specializationId?: number;

  @ApiProperty()
  // @IsNotEmpty()
  @IsString()
  @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
  content?: string;

  @ApiProperty({ type: () => WordMean, isArray: true })
  @IsNotEmpty()
  @IsArray()
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

export class CreateWordContributionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmptyObject()
  @IsObject()
  // @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => Content)
  content: Content;
}
