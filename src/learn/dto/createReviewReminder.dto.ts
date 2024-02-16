import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";

class DataRemind {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    wordId: number

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    reviewAt: Date
}

export class CreateReviewReminderDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    userVocabularySetId: number

    @ApiProperty()
    @Type(() => DataRemind)
    @IsArray()
    @ArrayNotEmpty()
    data: DataRemind[]
}