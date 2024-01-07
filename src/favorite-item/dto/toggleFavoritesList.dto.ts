import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class ToggleFavoritesListDto {
    @IsNotEmpty()
    @IsNumber()
    wordId?: number
}
