import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class CreatePronunciationAssessmentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    label: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    score: number

    @ApiProperty({ type: () => PhonemeAssessment, isArray: true })
    @IsArray()
    @Type(() => PhonemeAssessment)
    phones: PhonemeAssessment[]
}

class PhonemeAssessment {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    label: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    score: number
}
