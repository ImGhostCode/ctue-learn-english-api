import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Version,
} from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { CreateSenContributionDto, CreateWordContributionDto } from './dto';
import { GetAccount, Roles } from '../auth/decorator';
import { Account } from '@prisma/client';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ACCOUNT_TYPES } from '../global';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Contribution')
@UseGuards(MyJWTGuard, RolesGuard)
@Controller('contributions')
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) { }

  @Post('word')
  @Version('1')
  @ApiConsumes('multipart/form-data')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @UseInterceptors(FilesInterceptor('pictures'))
  createWordContribution(
    @Body() createWordConDto: CreateWordContributionDto,
    @GetAccount() account: Account,
    @UploadedFiles() pictures: Express.Multer.File[],
  ) {
    return this.contributionService.createWordCon(
      createWordConDto,
      account.userId,
      pictures,
    );
  }

  @Post('sentence')
  @Version('1')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  createSenContribution(
    @Body() createSenConDto: CreateSenContributionDto,
    @GetAccount() account: Account,
  ) {
    return this.contributionService.createSenCon(
      createSenConDto,
      account.userId,
    );
  }

  @Get()
  @Roles(ACCOUNT_TYPES.ADMIN)
  @Version('1')
  findAll(@Query() option: { page: number, type: string, status: number }) {
    return this.contributionService.findAll(option);
  }

  @Get('user/:id')
  @Version('1')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  findAllByUser(@Query() option: { type: string, page: number }, @Param('id', ParseIntPipe) id: number) {
    return this.contributionService.findAllByUser(option, id);
  }

  @Get(':id')
  @Version('1')
  @Roles(ACCOUNT_TYPES.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contributionService.findOne(id);
  }

  @Patch('verify/word/:id')
  @Version('1')
  @Roles(ACCOUNT_TYPES.ADMIN)
  verifyWordContribution(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: number; feedback: string },
  ) {
    return this.contributionService.verifyWordContribution(id, body);
  }

  @Patch('verify/sentence/:id')
  @Version('1')
  @Roles(ACCOUNT_TYPES.ADMIN)
  verifySenContribution(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: number; feedback: string },
  ) {
    return this.contributionService.verifySenContribution(id, body);
  }

  @Delete(':id')
  @Version('1')
  @Roles(ACCOUNT_TYPES.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetAccount() account: Account,
  ) {
    return this.contributionService.remove(id, account);
  }
}


