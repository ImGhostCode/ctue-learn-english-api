import {
  IsArray,
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

class Content {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  typeId?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @Transform((params: TransformFnParams) => {
    return params.value.map((item) => parseInt(item, 10));
  })
  @IsNumber({}, { each: true })
  topicId?: number[];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  levelId?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  specializationId?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mean?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(CONSTANTS_MAX.SENTENCE_NOTE_LEN)
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
  @IsString()
  synonyms?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  antonyms?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  picture?: string;
}

export class CreateContributionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string;

  // @IsNotEmptyObject()
  // @IsObject()
  // @IsNotEmpty()
  // @ValidateNested()
  @ApiProperty()
  @Type(() => Content)
  content: Content;
}
