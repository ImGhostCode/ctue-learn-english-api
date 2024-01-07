import { Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { ResponseData, AUTH_TYPES, ACCOUNT_TYPES } from '../global';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService, private jwtService: JwtService, private configService: ConfigService) { }

    async register(registerDto: RegisterDto) {
        try {
            const user = await this.prismaService.account.findUnique({
                where: { email: registerDto.email }
            })
            if (user) return new ResponseData<string>(null, 400, 'Email đã được sử dụng')
            const newUser = await this.prismaService.user.create({
                data: {
                    name: registerDto.name
                }
            })
            if (!newUser) return new ResponseData<string>(null, 400, 'Tạo tài khoản thất bại, thử lại')
            const hashedPassword = await argon2.hash(registerDto.password)
            const newAccount = await this.prismaService.account.create({
                data: {
                    email: registerDto.email,
                    password: hashedPassword,
                    authType: AUTH_TYPES.LOCAL,
                    accountType: ACCOUNT_TYPES.USER,
                    userId: newUser.id
                }
            })
            if (!newAccount) return new ResponseData<string>(null, 400, 'Tạo tài khoản thất bại, thử lại')
            await this.prismaService.favoriteItem.create({ data: { userId: newUser.id } })
            delete newAccount.password
            delete newUser.id
            const data = { ...newAccount, ...newUser }
            return new ResponseData<any>(data, 200, 'Tạo tài khoản thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async login(loginDto: LoginDto) {
        try {
            const account = await this.prismaService.account.findUnique({
                where: { email: loginDto.email }
            })
            if (!account) return new ResponseData<string>(null, 400, 'Tài khoản không tồn tại')
            const passwordMatched = await argon2.verify(account.password, loginDto.password)
            if (!passwordMatched) return new ResponseData<string>(null, 400, 'Mật khẩu không chính xác')
            if (account.isBan) return new ResponseData<any>({ feedback: account.feedback }, 403, 'Tài khoản đã bị khóa')
            const data = await this.signJwtToken(account.userId, account.email)
            return new ResponseData<any>(data, 200, 'Đăng nhập thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async signJwtToken(userId: number, email: string) {
        const payload = {
            sub: userId,
            email: email
        }
        const jwtString = await this.jwtService.signAsync(payload, {
            expiresIn: '24h',
            secret: this.configService.get('JWT_SECRET')
        })
        return {
            accessToken: jwtString
        }
    }
}
