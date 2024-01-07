import { Optional } from "@nestjs/common"
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from "class-validator"

export class CreatePraticeDto {
    @IsOptional()
    @IsNumber()
    typeId: number

    @IsOptional()
    @IsNumber()
    levelId: number

    @IsOptional()
    @IsNumber()
    specializationId: number

    @IsNotEmpty()
    @IsNumber()
    nRight: number

    @IsNotEmpty()
    @IsNumber()
    nWrong: number

    @IsNotEmpty()
    @IsNumber()
    nRightConsecutive: number

    @IsNotEmpty()
    @IsNumber()
    numOfSentence: number

    @IsNotEmpty()
    @IsArray()
    words: []
}