import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SentenceService } from './sentence.service';
import { CreateSentenceDto, UpdateSentenceDto } from './dto';
import { MyJWTGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { ACCOUNT_TYPES } from '../global';

@Controller('sentence')
export class SentenceController {
    constructor(private sentenceService: SentenceService) { }

    @Post()
    @UseGuards(MyJWTGuard, RolesGuard)
    @Roles(ACCOUNT_TYPES.ADMIN)
    create(@Body() createSentenceDto: CreateSentenceDto) {
        return this.sentenceService.create(createSentenceDto)
    }

    @Get()
    findAll(@Query() option: { topic: [], type: number, page: number, sort: any }) {
        return this.sentenceService.findAll(option)
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sentenceService.findOne(id)
    }

    @Patch(':id')
    @UseGuards(MyJWTGuard, RolesGuard)
    @Roles(ACCOUNT_TYPES.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSentenceDto: UpdateSentenceDto) {
        return this.sentenceService.update(id, updateSentenceDto)
    }

    @Delete(':id')
    @UseGuards(MyJWTGuard, RolesGuard)
    @Roles(ACCOUNT_TYPES.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sentenceService.delete(id)
    }
}
