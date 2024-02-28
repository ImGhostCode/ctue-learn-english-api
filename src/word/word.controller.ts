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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WordService } from './word.service';
import { CreateWordDto, UpdateWordDto } from './dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { GetAccount, Roles } from '../auth/decorator';
import { ACCOUNT_TYPES } from '../global';
import { Account } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesUploadDto } from './dto/uploadFile.dto';

@ApiTags('Word')
@Controller('word')
export class WordController {
  constructor(private wordServive: WordService) { }

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

  @Get('id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordServive.findOne(id)
  }

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

  @Delete(':id')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.wordServive.delete(id);
  }

  @Get('look-up-dictionary/:key')
  lookUpDictionary(@Param('key') key: string) {
    return this.wordServive.lookUpDictionary(key);
  }
}
