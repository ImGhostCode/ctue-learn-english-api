import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTopicDto, UpdateTopicDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseData } from '../global';
import { Topic } from '@prisma/client';

@Injectable()
export class TopicService {
  constructor(private prismaService: PrismaService) { }

  async create(createTopicDto: CreateTopicDto) {
    try {
      const isExisted = await this.IsExisted(createTopicDto.name)
      if (isExisted) throw new HttpException('Chủ đề đã tồn tại', HttpStatus.CONFLICT);
      return new ResponseData<Topic>(await this.prismaService.topic.create({
        data: {
          name: createTopicDto.name,
          isWord: createTopicDto.isWord,
          image: createTopicDto.image ?? ''
        }
      }), HttpStatus.CREATED, 'Tạo chủ đề thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(isWord: boolean) {
    try {
      return new ResponseData<Topic>(await this.prismaService.topic.findMany({
        where: {
          isWord: isWord
        }
      }), HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async IsExisted(name: string) {
    const topic = await this.prismaService.topic.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })
    if (topic) return true
    return false
  }

  async findOne(id: number) {
    return await this.prismaService.topic.findUnique({ where: { id: id } })
  }

  async update(id: number, updateTopicDto: UpdateTopicDto) {
    try {
      const topic = await this.findOne(id)
      if (!topic) throw new HttpException('Không tìm thấy chủ đề', HttpStatus.NOT_FOUND);
      const isExisted = await this.IsExisted(updateTopicDto.name)
      if (isExisted) throw new HttpException('Chủ đề đã tồn tại', HttpStatus.CONFLICT);
      return new ResponseData<Topic>(await this.prismaService.topic.update({
        where: {
          id: id
        },
        data: {
          name: updateTopicDto.name,
          isWord: updateTopicDto.isWord,
          image: updateTopicDto.image
        }
      }), HttpStatus.OK, 'Cập nhật thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const topic = await this.findOne(id)
      if (!topic) throw new HttpException('Không tìm thấy chủ đề', HttpStatus.NOT_FOUND);
      return new ResponseData<any>(await this.prismaService.topic.delete({ where: { id } }), HttpStatus.OK, 'Xóa thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
