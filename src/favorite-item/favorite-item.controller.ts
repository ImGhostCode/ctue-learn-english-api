import { Controller, Get, Body, Patch, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { FavoriteItemService } from './favorite-item.service';
import { ToggleFavoritesListDto } from './dto';
import { GetAccount, Roles } from '../auth/decorator';
import { Account } from '@prisma/client';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { ACCOUNT_TYPES } from '../global';

@UseGuards(MyJWTGuard, RolesGuard)
@Controller('favorite-item')
export class FavoriteItemController {
  constructor(private favoriteItemService: FavoriteItemService) { }

  @Patch()
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  addToFavoritesList(@Body() toggleFavoritesListDto: ToggleFavoritesListDto, @GetAccount() account: Account) {
    return this.favoriteItemService.toggleFavoritesList(toggleFavoritesListDto, account.userId);
  }

  @Get()
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  findAllByUserId(@GetAccount() accout: Account, @Query('sort') sort: string, @Query('key') key: string, @Query('page', ParseIntPipe) page: number) {
    return this.favoriteItemService.findAllByUserId(accout.userId, sort, key, page);
  }

  @Get('user')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  findAllByUser(@GetAccount() accout: Account) {
    return this.favoriteItemService.findAllByUser(accout.userId);
  }
}