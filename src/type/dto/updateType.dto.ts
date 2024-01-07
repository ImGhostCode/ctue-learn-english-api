import { IsNotEmpty, IsString } from "class-validator";

export class UpdateTypeDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    isWord: boolean
}
