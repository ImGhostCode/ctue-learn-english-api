import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ParseBoolPipe,
  UseGuards,
  Version,
  Query,
} from '@nestjs/common';
import { TypeService } from './type.service';
import { CreateTypeDto, UpdateTypeDto } from './dto';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { ACCOUNT_TYPES } from '../global';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Type')
@Controller('types')
export class TypeController {
  constructor(private readonly typeService: TypeService) { }

  @Post()
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  create(@Body() createTypeDto: CreateTypeDto) {
    return this.typeService.create(createTypeDto);
  }

  @Get('')
  @Version('1')
  findAll(@Query('isWord', ParseBoolPipe) isWord: boolean) {
    return this.typeService.findAll(isWord);
  }

  @Patch(':id')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTypeDto: UpdateTypeDto,
  ) {
    return this.typeService.update(id, updateTypeDto);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.typeService.remove(id);
  }
}
