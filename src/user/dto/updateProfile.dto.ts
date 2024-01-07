import { IsOptional, IsString, MaxLength } from "class-validator"
import { CONSTANTS_MAX } from "../../global"

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(CONSTANTS_MAX.NAME_LEN)
    name?: string
}