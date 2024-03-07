import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { VocabularySetsService } from './vocabulary-sets.service';
import { CreateVocaSetDto, UpdateVocaSetDto } from './dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MyJWTGuard, RolesGuard } from 'src/auth/guard';
import { ACCOUNT_TYPES } from 'src/global';
import { GetAccount, Roles } from 'src/auth/decorator';
import { Account } from '@prisma/client';

@ApiTags('Vocabulary Set')
@UseGuards(MyJWTGuard, RolesGuard)
@Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
@Controller('vocabulary-set')
export class VocabularySetsController {
  constructor(private readonly vocabularySetsService: VocabularySetsService) {
  }

  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  @Post()
  create(@Body() createVocaSetDto: CreateVocaSetDto, @GetAccount() account: Account, @UploadedFile() picture: Express.Multer.File) {
    return this.vocabularySetsService.create(account.userId, createVocaSetDto, picture);
  }

  @Patch('download/:id')
  downloadVocaSet(@Param('id') id: string, @GetAccount() account: Account) {
    return this.vocabularySetsService.downloadVocaSet(+id, account.userId)
  }

  @Delete('user/:id')
  rmDownloadedVocaSet(@Param('id') id: string, @GetAccount() account: Account) {
    return this.vocabularySetsService.rmDownloadedVocaSet(+id, account.userId)
  }

  @Get()
  findAllPublicVocaSets(@Query()
  option: {
    spec: number;
    topic: number;
    key: string;
  },) {
    return this.vocabularySetsService.findAll(option);
  }

  @Get('user')
  findAllByUser(@GetAccount() account: Account,) {
    return this.vocabularySetsService.findAllByUser(account.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vocabularySetsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  update(@Param('id') id: string, @Body() updateVocaSetDto: UpdateVocaSetDto, @UploadedFile() newPicture: Express.Multer.File, @GetAccount() account: Account,) {
    return this.vocabularySetsService.update(+id, updateVocaSetDto, newPicture, account);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vocabularySetsService.remove(+id);
  }
}
