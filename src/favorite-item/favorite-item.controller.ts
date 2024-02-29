import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { FavoriteItemService } from './favorite-item.service';
import { ToggleFavoritesListDto } from './dto';
import { GetAccount, Roles } from '../auth/decorator';
import { Account } from '@prisma/client';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { ACCOUNT_TYPES } from '../global';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Favorite')
@UseGuards(MyJWTGuard, RolesGuard)
@Controller('favorite')
export class FavoriteItemController {
  constructor(private favoriteItemService: FavoriteItemService) { }

  @Patch('/user')
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  toggleFavoritesList(
    @Body() toggleFavoritesListDto: ToggleFavoritesListDto,
    @GetAccount() account: Account,
  ) {
    return this.favoriteItemService.toggleFavoritesList(
      toggleFavoritesListDto,
      account.userId,
    );
  }

  @Get('/user')
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
  @Roles(ACCOUNT_TYPES.USER, ACCOUNT_TYPES.ADMIN)
  checkIsFavorite(@Param('wordId', ParseIntPipe) wordId: number, @GetAccount() accout: Account) {
    return this.favoriteItemService.checkIsFavorite(accout.userId, wordId);
  }
}
