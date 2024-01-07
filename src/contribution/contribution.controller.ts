import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { CreateContributionDto } from './dto';
import { GetAccount, Roles } from '../auth/decorator';
import { Account } from '@prisma/client';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ACCOUNT_TYPES } from '../global';

@UseGuards(MyJWTGuard, RolesGuard)
@Controller('contribution')
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) { }

  @Post()
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  @UseInterceptors(FileInterceptor('picture'))
  create(@Body() createContributionDto: CreateContributionDto, @GetAccount() account: Account, @UploadedFile() picture: Express.Multer.File) {
    return this.contributionService.create(createContributionDto, account.userId, picture);
  }

  @Get()
  @Roles(ACCOUNT_TYPES.ADMIN)
  findAll(@Query("type") type: string, @Query("status") status: number) {
    return this.contributionService.findAll(type, status);
  }

  @Get('user')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  findAllByUser(@Query("type") type: string, @GetAccount() account: Account) {
    return this.contributionService.findAllByUser(type, account.userId);
  }

  @Get(':id')
  @Roles(ACCOUNT_TYPES.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contributionService.findOne(id);
  }

  @Patch(':id')
  @Roles(ACCOUNT_TYPES.ADMIN)
  verifyContribute(@Param('id', ParseIntPipe) id: number, @Body() body: { status: number, feedback: string }) {
    return this.contributionService.verifyContribute(id, body);
  }

  @Delete(':id')
  @Roles(ACCOUNT_TYPES.ADMIN, ACCOUNT_TYPES.USER)
  remove(@Param('id', ParseIntPipe) id: number, @GetAccount() account: Account) {
    return this.contributionService.remove(id, account);
  }
}
