import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { WordService } from '../word/word.service';
import { SentenceService } from '../sentence/sentence.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [ContributionController],
  providers: [PrismaService, ContributionService, WordService, SentenceService, CloudinaryService, NotificationService],
})
export class ContributionModule { }
