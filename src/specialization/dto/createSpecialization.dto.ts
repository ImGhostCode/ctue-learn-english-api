import { IsNotEmpty, IsString } from "class-validator";

export class CreateSpecializationDto {
    @IsString()
    @IsNotEmpty()
    name: string
}
