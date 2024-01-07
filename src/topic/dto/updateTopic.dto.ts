import { Optional } from "@nestjs/common";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateTopicDto {
    @IsString()
    @IsOptional()
    name?: string

    @IsBoolean()
    @IsOptional()
    isWord?: boolean

    @Optional()
    @IsString()
    image?: string
}
