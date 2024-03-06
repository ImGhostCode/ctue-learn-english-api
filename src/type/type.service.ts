import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTypeDto, UpdateTypeDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseData } from '../global';
import { Type } from '@prisma/client';

@Injectable()
export class TypeService {
  constructor(private prismaService: PrismaService) { }

  async create(createTypeDto: CreateTypeDto) {
    try {
      const isExisted = await this.IsExisted(createTypeDto.name, createTypeDto.isWord)
      if (isExisted) throw new HttpException('Loại đã tồn tại', HttpStatus.CONFLICT);
      return new ResponseData<Type>(await this.prismaService.type.create({ data: { ...createTypeDto } }), HttpStatus.OK, 'Tạo loại thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(isWord: boolean) {
    try {
      return new ResponseData<{results: Type[]}>({results: await this.prismaService.type.findMany({ where: { isWord: isWord } })}, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async IsExisted(name: string, isWord: boolean) {
    const type = await this.prismaService.type.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        isWord: isWord
      }
    })
    if (type) return true
    return false
  }

  async findOne(id: number) {
    return await this.prismaService.type.findUnique({ where: { id: id } })
  }

  async update(id: number, updateTypeDto: UpdateTypeDto) {
    try {
      const type = await this.findOne(id)
      if (!type) throw new HttpException('Không tìm thấy loại', HttpStatus.NOT_FOUND);
      const isExisted = await this.IsExisted(updateTypeDto.name, updateTypeDto.isWord)
      if (isExisted) throw new HttpException('Loại đã tồn tại', HttpStatus.CONFLICT);
      return new ResponseData<Type>(await this.prismaService.type.update({ where: { id }, data: { ...updateTypeDto } }), HttpStatus.OK, 'Cập nhật thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const type = await this.findOne(id)
      if (!type) throw new HttpException('Không tìm thấy loại', HttpStatus.NOT_FOUND);
      return new ResponseData<any>(await this.prismaService.type.delete({ where: { id } }), HttpStatus.OK, 'Xóa thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
