import { Controller, Get, Query, UseGuards, Version } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { MyJWTGuard, RolesGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { ACCOUNT_TYPES } from 'src/global';

@Controller('statistics')
@UseGuards(MyJWTGuard, RolesGuard)
@Roles(ACCOUNT_TYPES.ADMIN)
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('/user')
    @Version('1')
    async getUserStatistics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return await this.statisticsService.getUserStatistics(startDate, endDate);
    }

    @Get('/contribution')
    @Version('1')
    async getContributionStatistics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return await this.statisticsService.getContributionStatistics(startDate, endDate);
    }

    @Get('/word')
    @Version('1')
    async getWordStatistics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return await this.statisticsService.getWordStatistics(startDate, endDate);
    }

    @Get('/sentence')
    @Version('1')
    async getSentenceStatistics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return await this.statisticsService.getSentenceStatistics(startDate, endDate);
    }

    @Get('/irregular-verb')
    @Version('1')
    async getIrregularVerbStatistics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return await this.statisticsService.getIrregularVerbStatistics(startDate, endDate);
    }

    @Get('/vocabulary-set')
    @Version('1')
    async getVocabPackStatistics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return await this.statisticsService.getVocabPackStatistics(startDate, endDate);
    }

    // ... các routes tương tự cho contributions, vocabulary
}
