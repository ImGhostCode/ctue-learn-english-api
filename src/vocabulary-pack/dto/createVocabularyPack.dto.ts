import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength } from "class-validator";
import { VOCABULARY_PACK } from "src/global";

export class CreateVocabPackDto {

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
    picture?: string;

    // @ApiProperty()
    // @IsOptional()
    // @IsBoolean()
    // isPublic: boolean

    @ApiProperty()
    @IsArray()
    @IsOptional()
    @ArrayMaxSize(VOCABULARY_PACK.MAX_WORDS)
    words: number[]
}