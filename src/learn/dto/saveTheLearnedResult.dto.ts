import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class SaveTheLearnedResultDto {
    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayNotEmpty()
    wordIds: number[]

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    // userVocabularySetId: number
    vocabularySetId: number

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayNotEmpty()
    memoryLevels: number[]
}