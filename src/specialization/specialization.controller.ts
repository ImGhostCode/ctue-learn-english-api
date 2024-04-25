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
import { SpecializationService } from './specialization.service';
import { CreateSpecializationDto, UpdateSpecializationDto } from './dto';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { ACCOUNT_TYPES } from '../global';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Specialization')
@Controller('specializations')
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) { }

  @Post()
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  create(@Body() createSpecializationDto: CreateSpecializationDto) {
    return this.specializationService.create(createSpecializationDto);
  }

  @Get()
  @Version('1')
  findAll() {
    return this.specializationService.findAll();
  }

  @Patch(':id')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpecializationDto: UpdateSpecializationDto,
  ) {
    return this.specializationService.update(id, updateSpecializationDto);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.specializationService.remove(id);
  }
}
