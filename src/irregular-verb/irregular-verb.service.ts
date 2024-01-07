import { Injectable } from '@nestjs/common';
import { CreateIrregularVerbDto, UpdateIrregularVerbDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE, ResponseData } from '../global';
import { IrregularVerb } from '@prisma/client';

@Injectable()
export class IrregularVerbService {
  constructor(private prismaService: PrismaService) { }

  async create(createIrregularVerbDto: CreateIrregularVerbDto) {
    try {
      const isExisted = await this.isExisted(createIrregularVerbDto.v1)
      if (isExisted) return new ResponseData<string>(null, 400, 'Động từ đã tồn tại')
      return new ResponseData<IrregularVerb>(await this.prismaService.irregularVerb.create({
        data: {
          v1: createIrregularVerbDto.v1,
          v2: createIrregularVerbDto.v2,
          v3: createIrregularVerbDto.v3,
          mean: createIrregularVerbDto.mean
        }
      }), 200, 'Tạo thành công động từ bất quy tắc')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findAll(option: { page: number, sort: any, key: string }) {
    let pageSize = PAGE_SIZE.PAGE_IRREGULAR
    try {
      let { key, page, sort } = option
      const totalCount = await this.prismaService.irregularVerb.count({
        where: {
          OR: [
            { v1: { contains: key } },
            { v2: { contains: key } },
            { v3: { contains: key } },
          ]
        }
      })
      let totalPages = Math.ceil(totalCount / pageSize)
      if (!totalPages) totalPages = 1
      if (!page || page < 1) page = 1
      if (page > totalPages) page = totalPages
      let next = (page - 1) * pageSize
      const irregularVerb = await this.prismaService.irregularVerb.findMany({
        orderBy: {
          v1: sort
        },
        skip: next,
        take: pageSize,
        where: {
          OR: [
            { v1: { contains: key } },
            { v2: { contains: key } },
            { v3: { contains: key } },
            { mean: { contains: key } },
          ]
        },
      })
      return new ResponseData<any>({ data: irregularVerb, totalPages }, 200, 'Tìm thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findOne(id: number) {
    try {
      const verb = await this.findById(id)
      if (!verb) return new ResponseData<string>(null, 400, 'Động từ không tồn tại')
      return new ResponseData<IrregularVerb>(verb, 200, 'Tìm thành công động từ')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async update(id: number, updateIrregularVerbDto: UpdateIrregularVerbDto) {
    try {
      const verb = await this.findById(id)
      if (!verb) return new ResponseData<string>(null, 400, 'Động từ không tồn tại')
      if (updateIrregularVerbDto.v1 && updateIrregularVerbDto.v1 !== verb.v1) {
        const isExisted = await this.isExisted(updateIrregularVerbDto.v1)
        if (isExisted) return new ResponseData<string>(null, 400, 'Động từ đã tồn tại')
      }
      return new ResponseData<IrregularVerb>(await this.prismaService.irregularVerb.update({
        where: {
          id: id
        },
        data: {
          v1: updateIrregularVerbDto.v1,
          v2: updateIrregularVerbDto.v2,
          v3: updateIrregularVerbDto.v3,
          mean: updateIrregularVerbDto.mean
        }
      }), 200, 'Cập nhật thành công động từ')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async remove(id: number) {
    const verb = await this.findById(id)
    if (!verb) return new ResponseData<string>(null, 400, 'Động từ không tồn tại')
    await this.prismaService.irregularVerb.delete({ where: { id } })
    return new ResponseData<string>(null, 200, 'Xóa thành công động từ')
  }

  async isExisted(content: string) {
    const verb = await this.prismaService.irregularVerb.findFirst({
      where: {
        v1: {
          equals: content,
          mode: 'insensitive'
        }
      }
    })
    if (verb) return true
    return false
  }

  async findById(id: number) {
    return this.prismaService.irregularVerb.findUnique({ where: { id } })
  }

  // async searchByKey(key: string) {
  //   try {
  //     const data = await this.prismaService.irregularVerb.findMany({
  //       where: {
  //         OR: [
  //           {
  //             v1: { contains: key }
  //           },
  //           {
  //             v2: { contains: key }
  //           },
  //           {
  //             v3: { contains: key }
  //           },
  //           {
  //             mean: { contains: key }
  //           },
  //         ]
  //       }
  //     })
  //     if (data.length === 0) {
  //       return new ResponseData<IrregularVerb>([], 400, 'Không tìm thấy từ');
  //     }
  //     return new ResponseData<IrregularVerb>(data, 200, 'Tìm thấy từ');
  //   } catch (error) {
  //     return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
  //   }
  // }
}
