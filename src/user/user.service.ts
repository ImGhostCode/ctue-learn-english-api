import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
            return new ResponseData<any>(account, HttpStatus.OK, 'Tài khoản tồn tại')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAccountDetailByAdmin(id: number) {
        try {
            const account = await this.prismaService.account.findFirst({
                where: { userId: id }, include: {
                    User: true
                }
            })
            return new ResponseData<any>(account, HttpStatus.OK, 'Tài khoản tồn tại')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getAllUsers(option: { page: number, name: string, isBanned: boolean }) {
        let pageSize = PAGE_SIZE.PAGE_USER
        try {
            let { page } = option
            const totalCount = await this.prismaService.account.count({
                where: {
                    accountType: 'user',
                    isDeleted: false,
                    isBanned: typeof option.isBanned === 'string' ? (option.isBanned === 'false' ? false : true) : option.isBanned,
                    User: {
                        name: {
                            contains: option.name,
                            mode: 'insensitive'
                        }
                    },
                }
            })
            const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)
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
                    isBanned: true,
                    User: {
                        include: {
                            Contribution: true
                        }
                    }
                },
                where: {
                    accountType: 'user',
                    isDeleted: false,
                    isBanned: typeof option.isBanned === 'string' ? (option.isBanned === 'false' ? false : true) : option.isBanned,

                    User: {
                        name: {
                            contains: option.name,
                            mode: 'insensitive'
                        },

                    },
                },
                orderBy: {
                    userId: 'asc'
                }
            })
            return new ResponseData<any>({ data: accounts, totalPages, total: totalCount }, HttpStatus.OK, 'Tìm thấy các người dùng')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async toggleBanUser(id: number, toggleBanUserDto: ToggleBanUserDto) {
        try {
            const account = await this.prismaService.account.findFirst({
                where: { userId: id }
            })
            let feedback = toggleBanUserDto.feedback
            if (account.isBanned) feedback = ''
            if (!account) throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND)
            await this.prismaService.account.update({
                where: { email: account.email },
                data: { isBanned: !account.isBanned, feedback: feedback }
            })
            if (!account.isBanned) return new ResponseData<any>(null, HttpStatus.OK, 'Khóa người dùng thành công')
            return new ResponseData<any>(null, HttpStatus.OK, 'Mở khóa người dùng thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateProfile(id: number, updateProfileDto: UpdateProfileDto, avt: Express.Multer.File) {
        try {
            const data: { name?: string, avt?: string, interestTopics?: number[] } = { ...updateProfileDto }

            const account = await this.prismaService.account.findFirst({
                where: { userId: id, isDeleted: false }
            })
            if (!account) throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND)
            if (avt) {
                const img = await this.cloudinaryService.uploadFile(avt)
                data.avt = img.url
            }

            const dataUpdate: any = {}
            if (data.name) dataUpdate.name = data.name
            if (data.avt) dataUpdate.avt = data.avt
            if (data.interestTopics) dataUpdate.interestTopics = { set: [], connect: data.interestTopics.map((id) => ({ id: Number(id) })) }

            const result = await this.prismaService.user.update({
                where: { id: id },
                data: dataUpdate,
                include: { interestTopics: true }
            })
            return new ResponseData<any>(result, HttpStatus.OK, 'Cập nhật thông tin thành công')
        } catch (error) {
            console.log(error);

            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto) {
        try {
            const account = await this.prismaService.account.findFirst({
                where: { userId: id, isDeleted: false }
            })
            if (!account) throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND)
            const passwordMatched = await argon2.verify(account.password, updatePasswordDto.oldPassword)
            if (!passwordMatched) throw new HttpException('Mật khẩu hiện tại không chính xác', HttpStatus.BAD_REQUEST)
            const hashedPassword = await argon2.hash(updatePasswordDto.newPassword)
            await this.prismaService.account.update({
                where: { email: account.email },
                data: { password: hashedPassword }
            })
            return new ResponseData<string>(null, HttpStatus.OK, 'Cập nhật mật khẩu thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteUser(id: number) {
        try {
            const account = await this.prismaService.account.findFirst({
                where: { userId: id }
            })
            if (!account) throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND)
            await this.prismaService.account.delete({
                where: { email: account.email },
                include: {
                    User: true
                }
            })
            await this.prismaService.user.delete({
                where: { id: account.userId }
            })
            return new ResponseData<any>(null, HttpStatus.OK, 'Xóa người dùng thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        try {
            const currentDate = new Date();
            const { email, code, newPassword } = resetPasswordDto
            const verifyCode = await this.prismaService.verifyCode.findFirst({
                where: { email, code }
            })
            if (!verifyCode) throw new HttpException('Mã xác minh không tồn tại', HttpStatus.NOT_FOUND)
            const createdAt = new Date(verifyCode.createdAt)
            createdAt.setMinutes(createdAt.getMinutes() + 5)
            if (createdAt <= currentDate) throw new HttpException('Quá thời gian của mã xác minh', HttpStatus.NOT_ACCEPTABLE)
            const account = await this.prismaService.account.findUnique({
                where: { email, isDeleted: false }
            })
            if (!account) throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND)
            const hashedPassword = await argon2.hash(newPassword)
            await this.prismaService.account.update({
                where: { email, isDeleted: false },
                data: { password: hashedPassword }
            })
            await this.prismaService.verifyCode.deleteMany({
                where: { email: email }
            })
            return new ResponseData<string>(null, HttpStatus.OK, 'Đổi mật khẩu thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async sendVerifyCode(verifyCodeDto: VerifyCodeDto) {
        try {
            const { email } = verifyCodeDto
            const account = await this.prismaService.account.findUnique({ where: { email, isDeleted: false }, include: { User: true } })
            if (!account) throw new HttpException('Tài khoản không tồn tại', HttpStatus.NOT_FOUND)
            await this.prismaService.verifyCode.deleteMany({ where: { email: email } })
            const code = this.random6DigitNumber()
            const verifyCode = await this.prismaService.verifyCode.create({
                data: {
                    email: verifyCodeDto.email,
                    code: parseInt(code)
                }
            })
            if (!verifyCode) throw new HttpException('Không tìm thấy mã xác minh', HttpStatus.NOT_FOUND);
            const emailSend = await this.mailerService.sendMail({
                to: email,
                subject: 'Mã OTP để thiết lập mật khẩu mới hoặc tài khoản Ứng dụng hỗ  trợ học tiếng anh',
                template: './verifycode',
                context: {
                    name: account.User.name,
                    code: code
                }
            })
            if (!emailSend) throw new HttpException('Gửi mã xác minh thất bại', HttpStatus.INTERNAL_SERVER_ERROR);
            return new ResponseData<string>(null, HttpStatus.OK, 'Gửi mã thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    random6DigitNumber() {
        const randomNumber = Math.floor(Math.random() * 1000000);
        const paddedNumber = randomNumber.toString().padStart(6, '0');
        return paddedNumber;
    }
}
