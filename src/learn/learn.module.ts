import { Module } from '@nestjs/common';
import { LearnService } from './learn.service';
import { LearnController } from './learn.controller';
import { PrismaService } from 'nestjs-prisma';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  controllers: [LearnController],
  providers: [LearnService, PrismaService, NotificationService],
})
export class LearnModule { }
