import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator"
import { CONSTANTS_MAX, CONSTANTS_MIN } from "../../global"

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsNumber()
    code: number

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(CONSTANTS_MAX.EMAIL_LEN)
    email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(CONSTANTS_MIN.PASSWORD_LEN)
    newPassword: string
}