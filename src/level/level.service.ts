import { Injectable } from '@nestjs/common';
import { CreateLevelDto, UpdateLevelDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseData } from 'src/global';
import { Level } from '@prisma/client';

@Injectable()
export class LevelService {
  constructor(private prismaService: PrismaService) { }

  async create(createLevelDto: CreateLevelDto) {
    try {
      const isExisted = await this.IsExisted(createLevelDto.name)
      if (isExisted) return new ResponseData<string>(null, 400, 'Cấp độ đã tồn tại')
      return new ResponseData<Level>(await this.prismaService.level.create({ data: { ...createLevelDto } }), 200, 'Tạo cấp độ thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findAll() {
    try {
      return new ResponseData<Level>(await this.prismaService.level.findMany({}), 200, 'Tìm thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async IsExisted(name: string) {
    const level = await this.prismaService.level.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })
    if (level) return true
    return false
  }

  async findOne(id: number) {
    return await this.prismaService.level.findUnique({ where: { id: id } })
  }

  async update(id: number, updateLevelDto: UpdateLevelDto) {
    try {
      const level = await this.findOne(id)
      if (!level) return new ResponseData<string>(null, 400, 'Không tìm thấy cấp độ')
      const isExisted = await this.IsExisted(updateLevelDto.name)
      if (isExisted) return new ResponseData<string>(null, 400, 'Cấp độ đã tồn tại')
      return new ResponseData<Level>(await this.prismaService.level.update({ where: { id }, data: { ...updateLevelDto } }), 200, 'Cập nhật thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async remove(id: number) {
    try {
      const level = await this.findOne(id)
      if (!level) return new ResponseData<string>(null, 400, 'Không tìm thấy cấp độ')
      return new ResponseData<any>(await this.prismaService.level.delete({ where: { id } }), 200, 'Xóa thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }
}
