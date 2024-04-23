import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Account } from '@prisma/client';
import { GetAccount, Roles } from './decorator';
import { MyJWTGuard, RolesGuard } from './guard';
import { ACCOUNT_TYPES } from 'src/global';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Version('1')
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Version('1')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  logout(@GetAccount() account: Account,) {
    return this.authService.logout(account.userId);
  }
}
