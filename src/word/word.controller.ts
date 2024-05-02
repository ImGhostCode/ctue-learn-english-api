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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { WordService } from './word.service';
import { CreateWordDto, UpdateWordDto } from './dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { GetAccount, Roles } from '../auth/decorator';
import { ACCOUNT_TYPES } from '../global';
import { Account } from '@prisma/client';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Word')
@Controller('words')
export class WordController {
  constructor(private wordServive: WordService) { }

  @Version('1')
  @Post()
  @UseInterceptors(FilesInterceptor('pictures'))
  @ApiConsumes('multipart/form-data')
  // @ApiBearerAuth('basic')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  create(
    @Body() createWordDto: CreateWordDto,
    @UploadedFiles() pictures: Express.Multer.File[],
  ) {
    return this.wordServive.create(createWordDto, pictures);
  }

  @Version('1')
  @Get('id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordServive.findOne(id)
  }

  @Version('1')
  @Get()
  findAll(
    @Query()
    option: {
      sort: any;
      type: number[];
      level: number;
      specialization: number;
      topic: [];
      page: number;
      key: string;
    },
  ) {
    return this.wordServive.findAll(option);
  }

  @Version('1')
  @Get('words-pack')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  getWordsPack(
    @Query()
    option: {
      types: number[];
      level: number;
      specialization: number;
      topic: [];
      numSentence: number;
    },
    @GetAccount() account: Account,
  ) {
    return this.wordServive.getWordsPack(account.userId, option);
  }



  @Version('1')
  @Patch(':id')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('new_pictures'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordDto: UpdateWordDto,
    @UploadedFiles() newPictures: Express.Multer.File[],
  ) {
    return this.wordServive.update(id, updateWordDto, newPictures);
  }

  @Version('1')
  @Delete(':id')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.wordServive.delete(id);
  }

  @Version('1')
  @Get('look-up-dictionary')
  lookUpDictionary(@Query('key') key: string) {
    return this.wordServive.lookUpDictionary(key);
  }

  @Version('1')
  @Get('content')
  getWordByContent(@Query('key') key: string) {
    return this.wordServive.getWordByContent(key);
  }
}
