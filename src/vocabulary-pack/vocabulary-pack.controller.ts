import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, Version } from '@nestjs/common';
import { VocabularyPackService } from './vocabulary-pack.service';
import { CreateVocabPackDto, UpdateVocabPackDto } from './dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MyJWTGuard, RolesGuard } from 'src/auth/guard';
import { ACCOUNT_TYPES } from 'src/global';
import { GetAccount, Roles } from 'src/auth/decorator';
import { Account } from '@prisma/client';

@ApiTags('Vocabulary Pack')
@UseGuards(MyJWTGuard, RolesGuard)
@Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
@Controller('vocabulary-packs')
export class VocabularyPackController {
  constructor(private readonly vocabularyPackService: VocabularyPackService) {
  }

  @Version('1')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  @Post()
  create(@Body() createVocabPackDto: CreateVocabPackDto, @GetAccount() account: Account, @UploadedFile() picture: Express.Multer.File) {
    return this.vocabularyPackService.create(account.userId, createVocabPackDto, picture);
  }

  @Version('1')
  @Patch('download/:id')
  downloadVocabPack(@Param('id') id: string, @GetAccount() account: Account) {
    return this.vocabularyPackService.downloadVocabPack(+id, account.userId)
  }

  @Version('1')
  @Delete('user/:id')
  rmDownloadedVocabPack(@Param('id') id: string, @GetAccount() account: Account) {
    return this.vocabularyPackService.rmDownloadedVocabPack(+id, account.userId)
  }

  @Version('1')
  @Get()
  findAllPublicVocabPacks(@Query()
  option: {
    spec: number;
    topic: number;
    key: string;
  },) {
    return this.vocabularyPackService.findAllPublicVocabPack(option);
  }

  @Version('1')
  @Roles(ACCOUNT_TYPES.ADMIN)
  @Get('admin')
  findAllByAdmin(@Query()
  option: {
    spec: number,
    topic: number,
    key: string,
    page: number
  },) {
    return this.vocabularyPackService.findAllByAdmin(option);
  }

  @Version('1')
  @Get('user')
  findAllByUser(@GetAccount() account: Account,) {
    return this.vocabularyPackService.findAllByUser(account.userId);
  }

  @Version('1')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vocabularyPackService.findOne(+id);
  }

  @Version('1')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  update(@Param('id') id: string, @Body() updateVocabPackDto: UpdateVocabPackDto, @UploadedFile() newPicture: Express.Multer.File, @GetAccount() account: Account,) {
    return this.vocabularyPackService.update(+id, updateVocabPackDto, newPicture, account);
  }

  @Version('1')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vocabularyPackService.remove(+id);
  }
}
