import { Injectable } from '@nestjs/common';
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
      if (isExisted) return new ResponseData<string>(null, 400, 'Loại đã tồn tại')
      return new ResponseData<Type>(await this.prismaService.type.create({ data: { ...createTypeDto } }), 200, 'Tạo loại thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findAll(isWord: boolean) {
    try {
      return new ResponseData<Type>(await this.prismaService.type.findMany({ where: { isWord: isWord } }), 200, 'Tìm thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
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
      if (!type) return new ResponseData<string>(null, 400, 'Không tìm thấy loại')
      const isExisted = await this.IsExisted(updateTypeDto.name, updateTypeDto.isWord)
      if (isExisted) return new ResponseData<string>(null, 400, 'Loại đã tồn tại')
      return new ResponseData<Type>(await this.prismaService.type.update({ where: { id }, data: { ...updateTypeDto } }), 200, 'Cập nhật thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async remove(id: number) {
    try {
      const type = await this.findOne(id)
      if (!type) return new ResponseData<string>(null, 400, 'Không tìm thấy loại')
      return new ResponseData<any>(await this.prismaService.type.delete({ where: { id } }), 200, 'Xóa thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }
}
