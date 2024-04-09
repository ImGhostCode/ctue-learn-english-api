import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PAGE_SIZE, ResponseData } from 'src/global';
import { PrismaService } from 'nestjs-prisma';
import { Notification } from '@prisma/client';
import * as admin from 'firebase-admin';



@Injectable()
export class NotificationService {
  constructor(private prismaService: PrismaService) { }

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const result = await this.prismaService.notification.create({
        data: {
          userId: createNotificationDto.userId,
          title: createNotificationDto.title,
          body: createNotificationDto.body,
          data: JSON.parse(JSON.stringify(createNotificationDto.data))
        }
      })

      return new ResponseData<Notification>(result, HttpStatus.CREATED, 'Tạo thông báo thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllByUser(option: { page: number, sort: any, key: string, }, userId: number) {
    let pageSize = PAGE_SIZE.PAGE_NOTIFICATION
    try {
      let { key, page, sort, } = option
      const totalCount = await this.prismaService.notification.count({
        where: {
          userId,
          title: {
            contains: key
          }
        }
      })
      const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)

      if (!page || page < 1) page = 1
      if (page > totalPages) page = totalPages
      let next = (page - 1) * pageSize
      const notifications = await this.prismaService.notification.findMany({
        orderBy: {
          createdAt: sort
        },
        skip: next,
        take: pageSize,
        where: {
          userId,
          title: {
            contains: key
          }
        },
      })
      return new ResponseData<any>({ data: notifications, totalPages, total: totalCount }, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      console.log(error)
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(option: { page: number, sort: any, key: string }) {
    let pageSize = PAGE_SIZE.PAGE_NOTIFICATION
    try {
      let { key, page, sort } = option
      const totalCount = await this.prismaService.notification.count({
        where: {
          title: {
            contains: key
          }
        }
      })
      const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)

      if (!page || page < 1) page = 1
      if (page > totalPages) page = totalPages
      let next = (page - 1) * pageSize
      const notifications = await this.prismaService.notification.findMany({
        orderBy: {
          createdAt: sort
        },
        skip: next,
        take: pageSize,
        where: {

          title: {
            contains: key
          }
        },
      })
      return new ResponseData<any>({ data: notifications, totalPages, total: totalCount }, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async findOne(id: number) {
    try {
      const notificationn = await this.findById(id)
      if (!notificationn) throw new HttpException('Thông báo không tồn tại', HttpStatus.NOT_FOUND)
      return new ResponseData<Notification>(notificationn, HttpStatus.OK, 'Tìm thành công thông báo')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: number) {
    return this.prismaService.notification.findUnique({ where: { id } })
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  async remove(id: number) {
    const notification = await this.findById(id)
    if (!notification) throw new HttpException('Thông báo không tồn tại', HttpStatus.NOT_FOUND)
    await this.prismaService.notification.delete({ where: { id } })
    return new ResponseData<string>(null, HttpStatus.OK, 'Xóa thành công thông báo')
  }

  async sendNotification(registrationToken: string, createNotificationDto: CreateNotificationDto) {
    try {
      await this.create(createNotificationDto);

      if (registrationToken) {
        // throw new HttpException('Registration Token không hợp lệ', HttpStatus.BAD_REQUEST);
        // } else {
        const message: any = {
          data: { ...createNotificationDto.data, data: JSON.stringify(createNotificationDto.data.data) },
          notification: {
            title: createNotificationDto.title,
            body: createNotificationDto.body,
          },
          token: registrationToken
        };

        await admin.messaging().send(message);
      }
      return new ResponseData(null, HttpStatus.OK, 'Gửi thông báo thành công');
    } catch (error) {
      console.log(error)
      if (error.code === 'messaging/registration-token-not-registered') {
        return new ResponseData(null, HttpStatus.CREATED, 'Thông báo đã được tạo');
      } else {
        throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

}
