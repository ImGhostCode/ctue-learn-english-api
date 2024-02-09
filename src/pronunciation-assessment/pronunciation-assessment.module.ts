import { Module } from '@nestjs/common';
import { PronunciationAssessmentService } from './pronunciation-assessment.service';
import { PronunciationAssessmentController } from './pronunciation-assessment.controller';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [PronunciationAssessmentController],
  providers: [PronunciationAssessmentService, PronunciationAssessmentService, PrismaService],
})
export class PronunciationAssessmentModule { }
