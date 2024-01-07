import { IsNotEmpty, IsString } from "class-validator";

export class UpdateSpecializationDto {
    @IsString()
    @IsNotEmpty()
    name: string
}
