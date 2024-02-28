import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LearnService } from './learn.service';
import { CreateLearnDto } from './dto/create-learn.dto';
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
@Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
export class LearnController {
  constructor(private readonly learnService: LearnService) { }

  @Post('learned-result')
  saveTheLearnedResult(@Body() saveTheLearnedResultDto: SaveTheLearnedResultDto, @GetAccount() account: Account) {
    return this.learnService.saveTheLearnedResult(saveTheLearnedResultDto, account.userId)
  }

  @Post('review-reminder')
  createReviewReminder(@Body() createReviewReminderDto: CreateReviewReminderDto, @GetAccount() account: Account) {
    return this.learnService.createReivewReminder(createReviewReminderDto, account.userId)
  }

  @Get('reminder-coming')
  getReminderComing(@GetAccount() account: Account) {
    return this.learnService.getReminderComing(account.userId)
  }

  @Get('statistics')
  getStatistics(@Query() query: { setId: number }, @GetAccount() account: Account) {
    return this.learnService.getStatistics(account.userId, +query.setId)
  }

  @Patch('review-reminder/:id')
  updateReminder(@Param('id') id: string, @Body() updateLearnDto: UpdateReviewReminderDto, @GetAccount() account: Account) {
    return this.learnService.updateReminder(+id, updateLearnDto, account.userId);
  }

  @Get(':setId?/user/learned')
  getUserLearnedWords(
    @Param('setId') setId: string | undefined,
    @GetAccount() account: Account
  ) {
    return this.learnService.getUserLearnedWords(setId ? +setId : undefined, account.userId);
  }

  // @Post()
  // create(@Body() createLearnDto: CreateLearnDto) {
  //   return this.learnService.create(createLearnDto);
  // }

  @Get()
  findAll() {
    return this.learnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learnService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLearnDto: UpdateLearnDto) {
    return this.learnService.update(+id, updateLearnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learnService.remove(+id);
  }
}
