import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"
import { CONSTANTS_MAX, CONSTANTS_MIN } from '../../global'

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(CONSTANTS_MAX.EMAIL_LEN)
    email: string

    @IsString()
    @MaxLength(CONSTANTS_MAX.NAME_LEN)
    @IsNotEmpty()
    name: string

    @IsString()
    @MinLength(CONSTANTS_MIN.PASSWORD_LEN)
    @IsNotEmpty()
    password: string
}