import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetAccount, Roles } from '../auth/decorator';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { Account } from '@prisma/client';
import { ACCOUNT_TYPES } from '../global';
import {
  UpdateProfileDto,
  UpdatePasswordDto,
  VerifyCodeDto,
  ToggleBanUserDto,
  ResetPasswordDto,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @Get('me')
  @Version('1')
  getMe(@GetAccount() account: Account) {
    return this.userService.getUser(account);
  }

  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  @Get()
  @Version('1')
  getAllUsers(@Query() option: { page: number, name: string, isBanned: boolean }) {
    return this.userService.getAllUsers(option);
  }

  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  @Patch('toggle-ban/:id')
  @Version('1')
  toggleBanUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleBanUserDto: ToggleBanUserDto,
  ) {
    return this.userService.toggleBanUser(id, toggleBanUserDto);
  }

  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @UseInterceptors(FileInterceptor('avt'))
  @Patch(':id')
  @Version('1')
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @GetAccount() account: Account,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avt: Express.Multer.File,
  ) {
    if (account.accountType == ACCOUNT_TYPES.USER)
      return this.userService.updateProfile(
        account.userId,
        updateProfileDto,
        avt,
      );
    return this.userService.updateProfile(id, updateProfileDto, avt);
  }

  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @Patch('update-password/:id')
  @Version('1')
  updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @GetAccount() account: Account,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    if (account.accountType == ACCOUNT_TYPES.USER)
      return this.userService.updatePassword(account.userId, updatePasswordDto);
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  @Delete(':id')
  @Version('1')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }

  @Patch('reset/password')
  @Version('1')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Post('verify-code')
  @Version('1')
  sendVerifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.userService.sendVerifyCode(verifyCodeDto);
  }


  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  @Get(':id')
  @Version('1')
  getAccountDetailByAdmin(@Param('id', ParseIntPipe) id: number,) {
    return this.userService.getAccountDetailByAdmin(id);
  }
}
