import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Version } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { MyJWTGuard, RolesGuard } from 'src/auth/guard';
import { GetAccount, Roles } from 'src/auth/decorator';
import { ACCOUNT_TYPES } from 'src/global';
import { Account } from '@prisma/client';


@Controller('notifications')
@UseGuards(MyJWTGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post()
  @Version('1')
  @Roles(ACCOUNT_TYPES.ADMIN)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @Version('1')
  @Roles(ACCOUNT_TYPES.ADMIN)
  findAll(@Query() option: { page: number; sort: any; key: string }) {
    return this.notificationService.findAll(option);
  }

  @Get('/user')
  @Version('1')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  findAllByUser(@Query() option: { page: number; sort: any; key: string }, @GetAccount() account: Account,) {
    return this.notificationService.findAllByUser(option, account.userId);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }

  @Post('send-notification')
  @Version('1')
  @Roles(ACCOUNT_TYPES.ADMIN)
  sendNotification(
    @Body() body: { registrationToken: string, createNotificationDto: CreateNotificationDto },
    // @GetAccount() account: Account,
  ) {
    return this.notificationService.sendNotification(body.registrationToken, body.createNotificationDto);
  }
}
