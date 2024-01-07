import { IsArray, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"
import { CONSTANTS_MAX } from "../../global"
import { Transform, TransformFnParams } from "class-transformer"
export class UpdateWordDto {
    @IsOptional()
    @IsNumber()
    practiceId?: number

    @IsOptional()
    @IsNumber()
    typeId?: number

    @IsOptional()
    @IsArray()
    // @Transform((params: TransformFnParams) => {
    //     return params.value.map(item => parseInt(item, 10));
    // })
    // @IsNumber({}, { each: true })
    topicId: number[]

    @IsOptional()
    @IsNumber()
    levelId?: number

    @IsOptional()
    @IsNumber()
    specializationId?: number

    @IsOptional()
    @IsString()
    @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
    content?: string

    @IsOptional()
    @IsString()
    @MaxLength(CONSTANTS_MAX.WORD_MEAN_LEN)
    mean?: string

    @IsOptional()
    @IsString()
    @MaxLength(CONSTANTS_MAX.WORD_NOTE_LEN)
    note?: string

    @IsOptional()
    @IsString()
    phonetic?: string

    @IsOptional()
    @IsArray()
    examples?: string[]

    @IsOptional()
    @IsArray()
    synonyms?: string[]

    @IsOptional()
    @IsArray()
    antonyms?: string[]
}