import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"
import { CONSTANTS_MAX } from "src/global"

export class CreateSentenceDto {
    @IsNumber()
    @IsNotEmpty()
    typeId: number

    @IsOptional()
    @IsArray()
    topicId: number[]

    @IsOptional()
    @IsNumber()
    userId?: number

    @IsString()
    @MaxLength(CONSTANTS_MAX.SENTENCE_CONTENT_LEN)
    @IsNotEmpty()
    content: string

    @IsString()
    @MaxLength(CONSTANTS_MAX.SENTENCE_MEAN_LEN)
    @IsNotEmpty()
    mean: string

    @IsOptional()
    @IsString()
    @MaxLength(CONSTANTS_MAX.SENTENCE_NOTE_LEN)
    note?: string
}