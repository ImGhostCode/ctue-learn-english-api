import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayMaxSize, IsArray, IsBoolean, IsBooleanString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { VOCABULARY_PACK } from "src/global";

export class UpdateVocabPackDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(VOCABULARY_PACK.TITLE_LEN)
  title: string;

  // @ApiProperty()
  // @IsNumber()
  // @IsOptional()
  // userId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  topicId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  specId?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  oldPicture?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty()
  @IsOptional()
  //@IsBoolean()
  // @IsBooleanString()
  @IsString()
  // @Transform(({ value }) => {
  // console.log(value)
  //    if (value === 'true') return true;
  //   if (value === 'false') return false;
  // return value;
  // })
  isPublic?: string

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(VOCABULARY_PACK.MAX_WORDS)
  words: number[]

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(VOCABULARY_PACK.MAX_WORDS)
  oldWords: number[]
}
