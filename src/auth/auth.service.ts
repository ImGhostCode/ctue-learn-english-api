import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
            if (user) throw new HttpException('Email đã được sử dụng', HttpStatus.CONFLICT);

            const newUser = await this.prismaService.user.create({
                data: {
                    name: registerDto.name,
                    interestTopics: {
                        connect: registerDto.interestTopics?.map((id) => ({ id }))
                    }
                }
            })
            if (!newUser) throw new HttpException('Tạo tài khoản thất bại, thử lại', HttpStatus.BAD_REQUEST);

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
            if (!newAccount) throw new HttpException('Tạo tài khoản thất bại, thử lại', HttpStatus.BAD_REQUEST);

            await this.prismaService.favoriteItem.create({ data: { userId: newUser.id } })
            delete newAccount.password
            delete newUser.id
            const data = { ...newAccount }
            return new ResponseData<any>(data, HttpStatus.CREATED, 'Tạo tài khoản thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async login(loginDto: LoginDto) {
        try {
            const account = await this.prismaService.account.findUnique({
                where: { email: loginDto.email, isDeleted: false }
            })
            if (!account) throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND);

            const passwordMatched = await argon2.verify(account.password, loginDto.password)
            // if (!passwordMatched) return new ResponseData<string>(null, HttpStatus.BAD_REQUEST, 'Mật khẩu không chính xác')
            if (!passwordMatched) throw new HttpException('Mật khẩu không chính xác', HttpStatus.BAD_REQUEST);

            if (account.isBan) return new ResponseData<any>({ feedback: account.feedback }, HttpStatus.FORBIDDEN, 'Tài khoản đã bị khóa')

            const test = await this.prismaService.user.update({ where: { id: account.userId }, data: { fcmToken: loginDto.fcmToken } })

            const data = await this.signJwtToken(account.userId, account.email)

            return new ResponseData<any>(data, HttpStatus.OK, 'Đăng nhập thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async logout(userId: number) {
        try {
            const user = await this.prismaService.user.findUnique({ where: { id: userId, isDeleted: false } })
            if (!user) {
                throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND);
            }
            await this.prismaService.user.update({
                where: { id: userId, }, data: {
                    fcmToken: null
                }
            })
            return new ResponseData<any>(null, HttpStatus.OK, 'Đăng xuất thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
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
