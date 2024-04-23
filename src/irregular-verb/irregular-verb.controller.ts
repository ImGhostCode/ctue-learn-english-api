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
  Query,
  Version,
} from '@nestjs/common';
import { IrregularVerbService } from './irregular-verb.service';
import { CreateIrregularVerbDto, UpdateIrregularVerbDto } from './dto';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { ACCOUNT_TYPES } from '../global';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Irregular Verb')
@Controller('irregular-verbs')
export class IrregularVerbController {
  constructor(private irregularVerbService: IrregularVerbService) { }

  @Post()
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  create(@Body() createIrregularVerbDto: CreateIrregularVerbDto) {
    return this.irregularVerbService.create(createIrregularVerbDto);
  }

  @Get()
  @Version('1')
  findAll(@Query() option: { page: number; sort: any; key: string }) {
    return this.irregularVerbService.findAll(option);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.irregularVerbService.findOne(id);
  }

  @Patch(':id')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIrregularVerbDto: UpdateIrregularVerbDto,
  ) {
    return this.irregularVerbService.update(id, updateIrregularVerbDto);
  }

  @Delete(':id')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.irregularVerbService.remove(id);
  }

  // @Get('seach/:key')
  // searchByKey(@Param('key') key: string) {
  //   return this.irregularVerbService.searchByKey(key)
  // }
}
