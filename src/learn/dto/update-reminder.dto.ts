import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional } from "class-validator";

export class UpdateReviewReminderDto {
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isDone: boolean
}