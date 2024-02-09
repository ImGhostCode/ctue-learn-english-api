import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PronunciationAssessmentService } from './pronunciation-assessment.service';
import { CreatePronunciationAssessmentDto } from './dto/create-pronunciation-assessment.dto';
import { UpdatePronunciationAssessmentDto } from './dto/update-pronunciation-assessment.dto';
import { ApiTags } from '@nestjs/swagger';
import { MyJWTGuard, RolesGuard } from 'src/auth/guard';
import { GetAccount } from 'src/auth/decorator';
import { Account } from '@prisma/client';

@ApiTags('Pronunciation Assessment')
@UseGuards(MyJWTGuard, RolesGuard)
@Controller('pronunciation-assessment')
export class PronunciationAssessmentController {
  constructor(private readonly pronunciationAssessmentService: PronunciationAssessmentService) { }

  @Post()
  create(@Body() createPronunciationAssessmentDto: CreatePronunciationAssessmentDto, @GetAccount() account: Account,) {
    return this.pronunciationAssessmentService.create(createPronunciationAssessmentDto, account.userId);
  }

  @Get()
  findAll() {
    return this.pronunciationAssessmentService.findAll();
  }

  @Get('user')
  findAllByUser(@GetAccount() account: Account,) {
    return this.pronunciationAssessmentService.findAllByUser(account.userId
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pronunciationAssessmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePronunciationAssessmentDto: UpdatePronunciationAssessmentDto) {
    return this.pronunciationAssessmentService.update(+id, updatePronunciationAssessmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pronunciationAssessmentService.remove(+id);
  }

  @Get('user/statistics')
  getUserProStatistics(@GetAccount() account: Account) {
    return this.pronunciationAssessmentService.getUserProStatistics(account.userId);
  }
}
