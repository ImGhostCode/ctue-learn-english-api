import { IsNotEmpty, MinLength } from 'class-validator';
import { CONSTANTS_MIN } from '../../global';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty()
  @MinLength(CONSTANTS_MIN.PASSWORD_LEN, {
    message: `Mật khẩu ít nhất ${CONSTANTS_MIN.PASSWORD_LEN} ký tự`,
  })
  @IsNotEmpty({ message: 'Không được để trống' })
  oldPassword: string;

  @ApiProperty()
  @MinLength(CONSTANTS_MIN.PASSWORD_LEN, {
    message: `Mật khẩu ít nhất ${CONSTANTS_MIN.PASSWORD_LEN} ký tự`,
  })
  @IsNotEmpty({ message: 'Không được để trống' })
  newPassword: string;
}
