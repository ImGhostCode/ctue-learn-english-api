import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE, ResponseData } from 'src/global';
import { UpdateProfileDto, VerifyCodeDto, UpdatePasswordDto, ResetPasswordDto, ToggleBanUserDto } from './dto';
import * as argon2 from 'argon2';
import { Account } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService, private cloudinaryService: CloudinaryService, private mailerService: MailerService) { }

    async getUser(account: Account) {
        try {
            return new ResponseData<any>(account, 200, 'Tài khoản tồn tại')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async getAllUsers(option: { page: number }) {
        let pageSize = PAGE_SIZE.PAGE_USER
        try {
            let { page } = option
            const totalCount = await this.prismaService.account.count({
                where: {
                    accountType: 'user'
                }
            })
            const totalPages = Math.ceil(totalCount / pageSize)
            if (!page || page < 1) page = 1
            if (page > totalPages) page = totalPages
            let next = (page - 1) * pageSize
            const accounts = await this.prismaService.account.findMany({
                skip: next,
                take: pageSize,
                select: {
                    email: true,
                    userId: true,
                    accountType: true,
                    authType: true,
                    isBan: true,
                    User: true
                },
                where: {
                    accountType: 'user'
                },
                orderBy: {
                    userId: 'asc'
                }
            })
            return new ResponseData<any>({ accounts, totalPages }, 200, 'Tìm thấy các người dùng')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async toggleBanUser(id: number, toggleBanUserDto: ToggleBanUserDto) {
        try {
            const account = await this.prismaService.account.findFirst({
                where: { userId: id }
            })
            let feedback = toggleBanUserDto.feedback
            if (account.isBan) feedback = ''
            if (!account) new ResponseData<any>(null, 400, 'Tài khoản không tồn tại')
            await this.prismaService.account.update({
                where: { email: account.email },
                data: { isBan: !account.isBan, feedback: feedback }
            })
            if (!account.isBan) return new ResponseData<any>(null, 200, 'Khóa người dùng thành công')
            return new ResponseData<any>(null, 200, 'Mở khóa người dùng thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async updateProfile(id: number, updateProfileDto: UpdateProfileDto, avt: Express.Multer.File) {
        try {
            const data: { name?: string, avt?: string } = { ...updateProfileDto }

            const account = await this.prismaService.account.findFirst({
                where: { userId: id }
            })
            if (!account) new ResponseData<any>(null, 400, 'Tài khoản không tồn tại')
            if (avt) {
                const img = await this.cloudinaryService.uploadFile(avt)
                data.avt = img.url
            }

            await this.prismaService.user.update({
                where: { id: id },
                data: data
            })
            return new ResponseData<any>(null, 200, 'Cập nhật thông tin thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto) {
        try {
            const account = await this.prismaService.account.findFirst({
                where: { userId: id }
            })
            if (!account) new ResponseData<any>(null, 400, 'Tài khoản không tồn tại')
            const passwordMatched = await argon2.verify(account.password, updatePasswordDto.oldPassword)
            if (!passwordMatched) return new ResponseData<string>(null, 400, 'Mật khẩu hiện tại không chính xác')
            const hashedPassword = await argon2.hash(updatePasswordDto.newPassword)
            await this.prismaService.account.update({
                where: { email: account.email },
                data: { password: hashedPassword }
            })
            return new ResponseData<string>(null, 200, 'Cập nhật mật khẩu thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async deleteUser(id: number) {
        try {
            const account = await this.prismaService.account.findFirst({
                where: { userId: id }
            })
            if (!account) new ResponseData<any>(null, 400, 'Tài khoản không tồn tại')
            await this.prismaService.account.delete({
                where: { email: account.email },
                include: {
                    User: true
                }
            })
            await this.prismaService.user.delete({
                where: { id: account.userId }
            })
            return new ResponseData<any>(null, 200, 'Xóa người dùng thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        try {
            const currentDate = new Date();
            const { email, code, newPassword } = resetPasswordDto
            const verifyCode = await this.prismaService.verifyCode.findFirst({
                where: { email, code }
            })
            if (!verifyCode) return new ResponseData<string>(null, 400, 'Mã xác minh không tồn tại')
            const createdAt = new Date(verifyCode.createdAt)
            createdAt.setMinutes(createdAt.getMinutes() + 5)
            if (createdAt <= currentDate) return new ResponseData<string>(null, 400, 'Quá thời gian của mã xác minh')
            const account = await this.prismaService.account.findUnique({
                where: { email }
            })
            if (!account) return new ResponseData<string>(null, 400, 'Tài khoản không tồn tại')
            const hashedPassword = await argon2.hash(newPassword)
            await this.prismaService.account.update({
                where: { email },
                data: { password: hashedPassword }
            })
            await this.prismaService.verifyCode.deleteMany({
                where: { email: email }
            })
            return new ResponseData<string>(null, 200, 'Đổi mật khẩu thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async sendVerifyCode(verifyCodeDto: VerifyCodeDto) {
        try {
            const { email } = verifyCodeDto
            const account = await this.prismaService.account.findUnique({ where: { email }, include: { User: true } })
            if (!account) return new ResponseData<any>(null, 400, 'Email này chưa đăng ký')
            await this.prismaService.verifyCode.deleteMany({ where: { email: email } })
            const code = this.random6DigitNumber()
            const verifyCode = await this.prismaService.verifyCode.create({
                data: {
                    email: verifyCodeDto.email,
                    code: parseInt(code)
                }
            })
            if (!verifyCode) return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
            const emailSend = await this.mailerService.sendMail({
                to: email,
                subject: 'Mã OTP để thiết lập mật khẩu mới hoặc tài khoản Ứng dụng hỗ  trợ học tiếng anh',
                template: './verifycode',
                context: {
                    name: account.User.name,
                    code: code
                }
            })
            if (!emailSend) return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
            return new ResponseData<string>(null, 200, 'Gửi mã thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    random6DigitNumber() {
        const randomNumber = Math.floor(Math.random() * 1000000);
        const paddedNumber = randomNumber.toString().padStart(6, '0');
        return paddedNumber;
    }
}
