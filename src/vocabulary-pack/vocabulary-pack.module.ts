import { Module } from '@nestjs/common';
import { VocabularyPackService } from './vocabulary-pack.service';
import { VocabularyPackController } from './vocabulary-pack.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [VocabularyPackController],
  providers: [VocabularyPackService, CloudinaryService],
})
export class VocabularyPackModule { }
