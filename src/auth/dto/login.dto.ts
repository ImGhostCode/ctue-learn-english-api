import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { CONSTANTS_MAX, CONSTANTS_MIN } from '../../global'

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(CONSTANTS_MAX.EMAIL_LEN)
    email: string

    @IsString()
    @MinLength(CONSTANTS_MIN.PASSWORD_LEN)
    password: string
}