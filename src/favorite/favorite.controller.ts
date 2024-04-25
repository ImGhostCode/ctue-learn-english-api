import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Query,
  ParseIntPipe,
  Param,
  Version,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { ToggleFavoriteDto } from './dto';
import { GetAccount, Roles } from '../auth/decorator';
import { Account } from '@prisma/client';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { ACCOUNT_TYPES } from '../global';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Favorite')
@UseGuards(MyJWTGuard, RolesGuard)
@Controller('favorites')
export class FavoriteController {
  constructor(private favoriteItemService: FavoriteService) { }

  @Patch('/user')
  @Version('1')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  toggleFavorite(
    @Body() toggleFavoriteDto: ToggleFavoriteDto,
    @GetAccount() account: Account,
  ) {
    return this.favoriteItemService.toggleFavorite(
      toggleFavoriteDto,
      account.userId,
    );
  }

  @Get('/user')
  @Version('1')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  findAllByUserId(
    @GetAccount() accout: Account,
    @Query('sort') sort: string = 'asc',
    @Query('key') key: string,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.favoriteItemService.findAllByUserId(
      accout.userId,
      sort,
      key,
      page,
    );
  }

  @Get('/user/is-favorite/:wordId')
  @Version('1')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  checkIsFavorite(@Param('wordId', ParseIntPipe) wordId: number, @GetAccount() accout: Account) {
    return this.favoriteItemService.checkIsFavorite(accout.userId, wordId);
  }
}
