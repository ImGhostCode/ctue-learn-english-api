import { Module } from '@nestjs/common';
import { LearnService } from './learn.service';
import { LearnController } from './learn.controller';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [LearnController],
  providers: [LearnService, PrismaService],
})
export class LearnModule { }
