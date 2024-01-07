import { Injectable } from '@nestjs/common';
import { CreateSpecializationDto, UpdateSpecializationDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseData } from '../global';
import { Specialization } from '@prisma/client';

@Injectable()
export class SpecializationService {
  constructor(private prismaService: PrismaService) { }

  async create(createSpecializationDto: CreateSpecializationDto) {
    try {
      const isExisted = await this.IsExisted(createSpecializationDto.name)
      if (isExisted) return new ResponseData<string>(null, 400, 'Chuyên ngành đã tồn tại')
      return new ResponseData<Specialization>(await this.prismaService.specialization.create({ data: { ...createSpecializationDto } }), 200, 'Tạo chuyên ngành thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findAll() {
    try {
      return new ResponseData<Specialization>(await this.prismaService.specialization.findMany({}), 200, 'Tìm thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async IsExisted(name: string) {
    const specialization = await this.prismaService.specialization.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })
    if (specialization) return true
    return false
  }

  async findOne(id: number) {
    return await this.prismaService.specialization.findUnique({ where: { id: id } })
  }

  async update(id: number, updateSpecializationDto: UpdateSpecializationDto) {
    try {
      const specialization = await this.findOne(id)
      if (!specialization) return new ResponseData<string>(null, 400, 'Không tìm thấy chuyên ngành')
      const isExisted = await this.IsExisted(updateSpecializationDto.name)
      if (isExisted) return new ResponseData<string>(null, 400, 'Chuyên ngành đã tồn tại')
      return new ResponseData<Specialization>(await this.prismaService.specialization.update({ where: { id }, data: { ...updateSpecializationDto } }), 200, 'Cập nhật thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async remove(id: number) {
    try {
      const specialization = await this.findOne(id)
      if (!specialization) return new ResponseData<string>(null, 400, 'Không tìm thấy chuyên ngành')
      return new ResponseData<any>(await this.prismaService.specialization.delete({ where: { id } }), 200, 'Xóa thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }
}
