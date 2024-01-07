import { IsArray, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"
import { CONSTANTS_MAX } from "../../global"

export class UpdateSentenceDto {
    @IsOptional()
    @IsNumber()
    typeId?: number

    @IsOptional()
    @IsArray()
    topicId?: number[]

    @IsOptional()
    @IsNumber()
    practiceId?: number

    @IsOptional()
    @IsString()
    @MaxLength(CONSTANTS_MAX.SENTENCE_CONTENT_LEN)
    content?: string

    @IsOptional()
    @IsString()
    @MaxLength(CONSTANTS_MAX.SENTENCE_MEAN_LEN)
    mean?: string

    @IsOptional()
    @IsString()
    @MaxLength(CONSTANTS_MAX.SENTENCE_NOTE_LEN)
    note?: string
}