import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLevelDto {
    @IsString()
    @IsNotEmpty()
    name: string
}
