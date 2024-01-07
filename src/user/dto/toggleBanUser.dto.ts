import { Optional } from "@nestjs/common";
import { IsString } from "class-validator";

export class ToggleBanUserDto {
    @Optional()
    @IsString()
    feedback?: string
}