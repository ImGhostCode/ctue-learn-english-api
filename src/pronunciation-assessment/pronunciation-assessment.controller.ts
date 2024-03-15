import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PronunciationAssessmentService } from './pronunciation-assessment.service';
import { CreatePronunciationAssessmentDto } from './dto/create-pronunciation-assessment.dto';
import { UpdatePronunciationAssessmentDto } from './dto/update-pronunciation-assessment.dto';
import { ApiTags } from '@nestjs/swagger';
import { MyJWTGuard, RolesGuard } from 'src/auth/guard';
import { GetAccount } from 'src/auth/decorator';
import { Account } from '@prisma/client';
import { AssessPronunciationDto } from './dto/assess-pronunciation.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Pronunciation Assessment')
@UseGuards(MyJWTGuard, RolesGuard)
@Controller('pronunciation-assessment')
export class PronunciationAssessmentController {
  constructor(private readonly pronunciationAssessmentService: PronunciationAssessmentService) { }

  // @Post('save')
  // create(@Body() createPronunciationAssessmentDto: CreatePronunciationAssessmentDto, @GetAccount() account: Account,) {
  //   return this.pronunciationAssessmentService.create(createPronunciationAssessmentDto, account.userId);
  // }

  @UseInterceptors(FileInterceptor('audio'))
  @Post('assess')
  assess(@Body() assessPronunciationDto: AssessPronunciationDto, @GetAccount() account: Account,
    @UploadedFile() audio: Express.Multer.File
  ) {
    return this.pronunciationAssessmentService.assess(assessPronunciationDto, account.userId, audio);
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
