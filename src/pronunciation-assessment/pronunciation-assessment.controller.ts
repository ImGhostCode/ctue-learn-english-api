import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Version } from '@nestjs/common';
import { PronunciationAssessmentService } from './pronunciation-assessment.service';
import { UpdatePronunciationAssessmentDto } from './dto/update-pronunciation-assessment.dto';
import { ApiTags } from '@nestjs/swagger';
import { MyJWTGuard, RolesGuard } from 'src/auth/guard';
import { GetAccount } from 'src/auth/decorator';
import { Account } from '@prisma/client';
import { AssessPronunciationDto } from './dto/assess-pronunciation.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Pronunciation Assessment')
@UseGuards(MyJWTGuard, RolesGuard)
@Controller('pronunciation-assessments')
export class PronunciationAssessmentController {
  constructor(private readonly pronunciationAssessmentService: PronunciationAssessmentService) { }

  // @Post('save')
  // create(@Body() createPronunciationAssessmentDto: CreatePronunciationAssessmentDto, @GetAccount() account: Account,) {
  //   return this.pronunciationAssessmentService.create(createPronunciationAssessmentDto, account.userId);
  // }

  @UseInterceptors(FileInterceptor('audio'))
  @Post('assess')
  @Version('1')
  assess(@Body() assessPronunciationDto: AssessPronunciationDto, @GetAccount() account: Account,
    @UploadedFile() audio: Express.Multer.File
  ) {
    return this.pronunciationAssessmentService.assess(assessPronunciationDto, account.userId, audio);
  }

  @Get()
  @Version('1')
  findAll() {
    return this.pronunciationAssessmentService.findAll();
  }

  @Get('user')
  @Version('1')
  findAllByUser(@GetAccount() account: Account,) {
    return this.pronunciationAssessmentService.findAllByUser(account.userId
    );
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.pronunciationAssessmentService.findOne(+id);
  }

  @Patch(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updatePronunciationAssessmentDto: UpdatePronunciationAssessmentDto) {
    return this.pronunciationAssessmentService.update(+id, updatePronunciationAssessmentDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.pronunciationAssessmentService.remove(+id);
  }

  @Get('user/statistics')
  @Version('1')
  getUserProStatistics(@GetAccount() account: Account) {
    return this.pronunciationAssessmentService.getUserProStatistics(account.userId);
  }
}
