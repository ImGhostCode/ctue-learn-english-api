import { Optional } from "@nestjs/common";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateTopicDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsBoolean()
    @IsNotEmpty()
    isWord: boolean

    @Optional()
    @IsString()
    image: string
}
