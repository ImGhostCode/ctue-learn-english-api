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
@Controller('vocabulary-sets')
export class VocabularySetsController {
  constructor(private readonly vocabularySetsService: VocabularySetsService) {
  }

  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @Post()
  create(@Body() createVocaSetDto: CreateVocaSetDto, @GetAccount() account: Account, @UploadedFile() picture: Express.Multer.File) {
    return this.vocabularySetsService.create(account.userId, account.accountType, createVocaSetDto, picture);
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
  findAllByUser(@Query()
  option: {
    spec: number;
    topic: number;
    key: string;
  }, @GetAccount() account: Account,) {
    return this.vocabularySetsService.findAllByUser(account.userId, option);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vocabularySetsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  update(@Param('id') id: string, @Body() updateVocaSetDto: UpdateVocaSetDto, @UploadedFile() newPicture: Express.Multer.File) {
    return this.vocabularySetsService.update(+id, updateVocaSetDto, newPicture);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vocabularySetsService.remove(+id);
  }
}
