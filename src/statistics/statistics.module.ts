import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { PrismaService } from 'nestjs-prisma';

@Module({
    controllers: [StatisticsController],
    providers: [StatisticsService, PrismaService],

})
export class StatisticsModule {

}
