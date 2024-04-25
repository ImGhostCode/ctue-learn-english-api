import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSentenceDto, UpdateSentenceDto } from './dto';
import { PAGE_SIZE, ResponseData } from '../global';
import { Sentence } from '@prisma/client';

@Injectable()
export class SentenceService {
    constructor(private prismaService: PrismaService) { }

    async create(createSentenceDto: CreateSentenceDto) {
        try {
            let { topicId, typeId, content, meaning, note, userId } = createSentenceDto
            const isExisted = await this.isExisted(createSentenceDto.content)
            if (isExisted) throw new HttpException('Câu đã tồn tại', HttpStatus.CONFLICT);
            topicId = topicId.map((id) => Number(id))
            topicId = topicId.filter((id) => id !== 0)
            const sentence = await this.prismaService.sentence.create({
                data: {
                    typeId: typeId,
                    userId: userId,
                    content: content,
                    meaning: meaning,
                    note: note,
                    Topic: {
                        connect: topicId.map((id) => ({ id }))
                    }
                },
                include: {
                    Type: true,
                    Topic: true
                }
            })
            return new ResponseData<Sentence>(sentence, HttpStatus.CREATED, 'Tạo câu thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(option: { topic: [], type?: number, page: number, sort?: any, key?: string }) {
        let pageSize = PAGE_SIZE.PAGE_SENTENCE
        try {
            let { sort, type, topic, page, key } = option

            const whereClause: any = {
                content: {
                    contains: key || ''
                    , mode: 'insensitive'
                },
                Topic: {},
                isDeleted: false
            };

            if (topic) {
                // if (topic.length > 1) {
                whereClause.Topic = {
                    some: { id: { in: topic.map(topic => Number(topic)) } }
                };
                // } else {
                //     whereClause.Topic = {
                //         some: { id: Number(topic) }
                //     };
                // }
            }

            if (type) {
                whereClause.typeId = Number(type);
            }

            const totalCount = await this.prismaService.sentence.count({
                where: whereClause,
            });

            const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)

            if (!page || page < 1) page = 1
            if (page > totalPages) page = totalPages
            let next = (page - 1) * pageSize
            const sentences = await this.prismaService.sentence.findMany({
                skip: next,
                take: pageSize,
                orderBy: {
                    content: sort
                },
                where: whereClause,
                include: {
                    // Practice: true,
                    Topic: true,
                    Type: true
                }
            })
            return new ResponseData<any>({ data: sentences, totalPages, total: totalCount }, HttpStatus.OK, 'Tìm thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: number) {
        try {
            const sentence = await this.findById(id)
            if (!sentence) throw new HttpException('Câu không tồn tại', HttpStatus.NOT_FOUND);
            return new ResponseData<Sentence>(sentence, HttpStatus.OK, 'Tìm thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update(id: number, updateSentenceDto: UpdateSentenceDto) {
        try {
            let { typeId, content, meaning, note, topicId } = updateSentenceDto
            const sentence = await this.findById(id)
            if (!sentence) throw new HttpException('Câu không tồn tại', HttpStatus.NOT_FOUND);
            if (content && sentence.content !== content) {
                const isExisted = await this.isExisted(content)
                if (isExisted) throw new HttpException('Câu này đã tồn tại', HttpStatus.CONFLICT);
            }
            if (topicId) {
                await this.prismaService.sentence.update({
                    where: { id: id },
                    data: {
                        Topic: { disconnect: sentence.Topic.map((id) => id) }
                    }
                })
                topicId = topicId.map((id) => Number(id))
                topicId = topicId.filter((id) => id !== 0)
            } else {
                topicId = []
            }
            const newSentence = await this.prismaService.sentence.update({
                where: { id: id },
                data: {
                    typeId,
                    content,
                    meaning,
                    note,
                    Topic: { connect: topicId.map((id) => ({ id })) }
                },
                include: {
                    //Practice: true,
                    Topic: true,
                    Type: true
                }
            })
            return new ResponseData<Sentence>(newSentence, HttpStatus.OK, 'Cập nhật thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: number) {
        try {
            const sentence = await this.findById(id)
            if (!sentence) throw new HttpException('Câu không tồn tại', HttpStatus.NOT_FOUND);
            return new ResponseData<Sentence>(await this.prismaService.sentence.delete({ where: { id: id } }), HttpStatus.OK, 'Xóa thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async isExisted(content: string) {
        const centence = await this.prismaService.sentence.findFirst({
            where: {
                content: {
                    equals: content,
                    mode: 'insensitive'
                },
                isDeleted: false
            }
        })
        if (centence) return true
        return false
    }

    async findById(id: number) {
        return await this.prismaService.sentence.findUnique({
            where: {
                id: id, isDeleted: false
            },
            include: {
                //Practice: true,
                User: true,
                Topic: true,
                Type: true
            }
        })
    }
}
