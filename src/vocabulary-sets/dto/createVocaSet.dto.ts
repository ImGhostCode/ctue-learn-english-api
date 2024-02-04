import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength } from "class-validator";
import { VOCABULARY_SET } from "src/global";

export class CreateVocaSetDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(VOCABULARY_SET.TITLE_LEN)
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
    @ArrayMaxSize(VOCABULARY_SET.MAX_WORDS)
    words: number[]
}