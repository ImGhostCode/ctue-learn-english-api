import { Module } from '@nestjs/common';
import { IrregularVerbService } from './irregular-verb.service';
import { IrregularVerbController } from './irregular-verb.controller';

@Module({
  controllers: [IrregularVerbController],
  providers: [IrregularVerbService],
})
export class IrregularVerbModule { }
