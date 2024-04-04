import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      if (isExisted) throw new HttpException('Động từ đã tồn tại', HttpStatus.CONFLICT);
      return new ResponseData<IrregularVerb>(await this.prismaService.irregularVerb.create({
        data: {
          v1: createIrregularVerbDto.v1,
          v2: createIrregularVerbDto.v2,
          v3: createIrregularVerbDto.v3,
          meaning: createIrregularVerbDto.meaning
        }
      }), HttpStatus.CREATED, 'Tạo thành công động từ bất quy tắc')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(option: { page: number, sort: any, key: string }) {
    let pageSize = PAGE_SIZE.PAGE_IRREGULAR
    try {
      let { key, page, sort } = option
      const totalCount = await this.prismaService.irregularVerb.count({
        where: {
          isDeleted: false,
          OR: [
            { v1: { contains: key } },
            { v2: { contains: key } },
            { v3: { contains: key } },
          ]
        }
      })
      const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)

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
        isDeleted: false,
          OR: [
            { v1: { contains: key } },
            { v2: { contains: key } },
            { v3: { contains: key } },
            { meaning: { contains: key } },
          ]
        },
      })
      return new ResponseData<any>({ data: irregularVerb, totalPages, total: totalCount }, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const verb = await this.findById(id)
      if (!verb) throw new HttpException('Động từ không tồn tại', HttpStatus.NOT_FOUND)
      return new ResponseData<IrregularVerb>(verb, HttpStatus.OK, 'Tìm thành công động từ')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateIrregularVerbDto: UpdateIrregularVerbDto) {
    try {
      const verb = await this.findById(id)
      if (!verb) throw new HttpException('Động từ không tồn tại', HttpStatus.NOT_FOUND)
      if (updateIrregularVerbDto.v1 && updateIrregularVerbDto.v1 !== verb.v1) {
        const isExisted = await this.isExisted(updateIrregularVerbDto.v1)
        if (isExisted) throw new HttpException('Động từ đã tồn tại', HttpStatus.CONFLICT)
      }
      return new ResponseData<IrregularVerb>(await this.prismaService.irregularVerb.update({
        where: {
          id: id
        },
        data: {
          v1: updateIrregularVerbDto.v1,
          v2: updateIrregularVerbDto.v2,
          v3: updateIrregularVerbDto.v3,
          meaning: updateIrregularVerbDto.meaning
        }
      }), HttpStatus.OK, 'Cập nhật thành công động từ')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const verb = await this.findById(id)
    if (!verb) throw new HttpException('Động từ không tồn tại', HttpStatus.NOT_FOUND)
    await this.prismaService.irregularVerb.delete({ where: { id } })
    return new ResponseData<string>(null, HttpStatus.OK, 'Xóa thành công động từ')
  }

  async isExisted(content: string) {
    const verb = await this.prismaService.irregularVerb.findFirst({
      where: {
        isDeleted: false,
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
    return this.prismaService.irregularVerb.findUnique({ where: { id, isDeleted: false, } })
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
  //             meaning: { contains: key }
  //           },
  //         ]
  //       }
  //     })
  //     if (data.length === 0) {
  //       return new ResponseData<IrregularVerb>([], 400, 'Không tìm thấy từ');
  //     }
  //     return new ResponseData<IrregularVerb>(data, HttpStatus.OK, 'Tìm thấy từ');
  //   } catch (error) {
  //     throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}
