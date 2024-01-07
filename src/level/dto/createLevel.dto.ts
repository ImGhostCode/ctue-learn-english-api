import { IsNotEmpty, IsString } from "class-validator";

export class CreateLevelDto {
    @IsString()
    @IsNotEmpty()
    name: string
}
