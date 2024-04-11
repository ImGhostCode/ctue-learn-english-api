import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Account } from '@prisma/client';
import { GetAccount, Roles } from './decorator';
import { MyJWTGuard, RolesGuard } from './guard';
import { ACCOUNT_TYPES } from 'src/global';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  logout(@GetAccount() account: Account,) {
    return this.authService.logout(account.userId);
  }
}
