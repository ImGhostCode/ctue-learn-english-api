import { IsNotEmpty, MinLength } from "class-validator"
import { CONSTANTS_MIN } from "../../global"

export class UpdatePasswordDto {
    @MinLength(CONSTANTS_MIN.PASSWORD_LEN, { message: `Mật khẩu ít nhất ${CONSTANTS_MIN.PASSWORD_LEN} ký tự` })
    @IsNotEmpty({ message: 'Không được để trống' })
    oldPassword: string

    @MinLength(CONSTANTS_MIN.PASSWORD_LEN, { message: `Mật khẩu ít nhất ${CONSTANTS_MIN.PASSWORD_LEN} ký tự` })
    @IsNotEmpty({ message: 'Không được để trống' })
    newPassword: string
}