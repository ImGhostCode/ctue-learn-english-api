import { Module } from '@nestjs/common';
import { WordController } from './word.controller';
import { WordService } from './word.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  controllers: [WordController],
  providers: [WordService, CloudinaryService],
  exports: [WordService]
})
export class WordModule { }
