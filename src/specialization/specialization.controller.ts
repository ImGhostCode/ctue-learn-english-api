import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SpecializationService } from './specialization.service';
import { CreateSpecializationDto, UpdateSpecializationDto } from './dto';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { ACCOUNT_TYPES } from '../global';

@Controller('specialization')
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) { }

  @Post()
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  create(@Body() createSpecializationDto: CreateSpecializationDto) {
    return this.specializationService.create(createSpecializationDto);
  }

  @Get()
  findAll() {
    return this.specializationService.findAll();
  }

  @Patch(':id')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSpecializationDto: UpdateSpecializationDto) {
    return this.specializationService.update(id, updateSpecializationDto);
  }

  @Delete(':id')
  @UseGuards(MyJWTGuard, RolesGuard)
  @Roles(ACCOUNT_TYPES.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.specializationService.remove(id);
  }
}
