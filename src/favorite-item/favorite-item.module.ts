import { Module } from '@nestjs/common';
import { FavoriteItemService } from './favorite-item.service';
import { FavoriteItemController } from './favorite-item.controller';

@Module({
  controllers: [FavoriteItemController],
  providers: [FavoriteItemService],
})
export class FavoriteItemModule {}
