import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Version,
} from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto, UpdateLevelDto } from './dto';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { ACCOUNT_TYPES } from '../global';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Level')
@Controller('levels')
export class LevelController {
  constructor(private levelService: LevelService) { }

  @Post()
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelService.create(createLevelDto);
  }

  @Get()
  @Version('1')
  findAll() {
    return this.levelService.findAll();
  }

  @Patch(':id')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLevelDto: UpdateLevelDto,
  ) {
    return this.levelService.update(id, updateLevelDto);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.levelService.remove(id);
  }
}
