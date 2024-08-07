import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Version, ParseIntPipe } from '@nestjs/common';
import { LearnService } from './learn.service';
import { UpdateLearnDto } from './dto/update-learn.dto';
import { ApiTags } from '@nestjs/swagger';
import { MyJWTGuard, RolesGuard } from 'src/auth/guard';
import { ACCOUNT_TYPES } from 'src/global';
import { GetAccount, Roles } from 'src/auth/decorator';
import { SaveTheLearnedResultDto } from './dto/saveTheLearnedResult.dto';
import { CreateReviewReminderDto } from './dto/createReviewReminder.dto';
import { Account } from '@prisma/client';
import { UpdateReviewReminderDto } from './dto/update-reminder.dto';

@Controller('learn')
@ApiTags('Learn')
@UseGuards(MyJWTGuard, RolesGuard)
export class LearnController {
  constructor(private readonly learnService: LearnService) { }

  @Post('learned-result')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @Version('1')
  saveTheLearnedResult(@Body() saveTheLearnedResultDto: SaveTheLearnedResultDto, @GetAccount() account: Account) {
    return this.learnService.saveTheLearnedResult(saveTheLearnedResultDto, account.userId)
  }

  @Post('review-reminder')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @Version('1')
  createReviewReminder(
    @Body() createReviewReminderDto: CreateReviewReminderDto, @GetAccount() account: Account) {
    return this.learnService.createReivewReminder(createReviewReminderDto, account.userId)
  }

  @Get('upcoming-reminder')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @Version('1')
  getUpcomingReminder(@GetAccount() account: Account, @Query('packId') packId?: number) {
    return this.learnService.getUpcomingReminder(account.userId, packId)
  }

  @Get('statistics')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @Version('1')
  getStatistics(@Query() query: { packId?: number | undefined }, @GetAccount() account: Account) {
    return this.learnService.getStatistics(account.userId, +query.packId)
  }

  @Patch('review-reminder/:id')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @Version('1')
  updateReminder(@Param('id') id: string, @Body() updateLearnDto: UpdateReviewReminderDto, @GetAccount() account: Account) {
    return this.learnService.updateReminder(+id, updateLearnDto, account.userId);
  }

  @Get(':packId?/user/learned')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @Version('1')
  getUserLearnedWords(
    @Param('packId') packId: string | undefined,
    @GetAccount() account: Account
  ) {
    return this.learnService.getUserLearnedWords(packId ? +packId : undefined, account.userId);
  }

  @Get('history/:userId?')
  @Roles(ACCOUNT_TYPES.ADMIN)
  @Version('1')
  getLeaningHistory(@Query() option: { level: number, page: number, sort: string }, @Param('userId') userId?: number | undefined) {
    return this.learnService.getLeaningHistory(option, +userId);
  }


  @Get()
  @Version('1')
  findAll() {
    return this.learnService.findAll();
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.learnService.findOne(+id);
  }

  @Patch(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updateLearnDto: UpdateLearnDto) {
    return this.learnService.update(+id, updateLearnDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.learnService.remove(+id);
  }

  sendNotiRemindToReview() {
    return this.learnService.sendNotiRemindToReview();
  }


}
