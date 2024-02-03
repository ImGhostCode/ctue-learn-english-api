import { Module } from '@nestjs/common';
import { VocabularySetsService } from './vocabulary-sets.service';
import { VocabularySetsController } from './vocabulary-sets.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [VocabularySetsController],
  providers: [VocabularySetsService, CloudinaryService],
})
export class VocabularySetsModule { }
