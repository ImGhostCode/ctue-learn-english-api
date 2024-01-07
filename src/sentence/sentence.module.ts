import { Module } from '@nestjs/common';
import { SentenceController } from './sentence.controller';
import { SentenceService } from './sentence.service';

@Module({
  controllers: [SentenceController],
  providers: [SentenceService],
  exports: [SentenceService]
})
export class SentenceModule { }
