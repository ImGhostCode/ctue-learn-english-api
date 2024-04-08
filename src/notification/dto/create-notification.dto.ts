import { IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateNotificationDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number

    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    body: string

    @IsOptional()
    data: JSON
}
