import { Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';

@Module({
  controllers: [TypeController],
  providers: [TypeService],
})
export class TypeModule {}
