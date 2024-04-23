import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { SentenceService } from './sentence.service';
import { CreateSentenceDto, UpdateSentenceDto } from './dto';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { ACCOUNT_TYPES } from '../global';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sentence')
@Controller('sentences')
export class SentenceController {
  constructor(private sentenceService: SentenceService) { }

  @Post()
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  create(@Body() createSentenceDto: CreateSentenceDto) {
    return this.sentenceService.create(createSentenceDto);
  }

  @Get()
  @Version('1')
  findAll(
    @Query() option: { topic: []; type: number; page: number; sort: any, key?: string },
  ) {
    return this.sentenceService.findAll(option);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sentenceService.findOne(id);
  }

  @Patch(':id')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSentenceDto: UpdateSentenceDto,
  ) {
    return this.sentenceService.update(id, updateSentenceDto);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sentenceService.delete(id);
  }
}
