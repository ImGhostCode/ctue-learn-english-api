import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSentenceDto, UpdateSentenceDto } from './dto';
import { PAGE_SIZE, ResponseData } from '../global';
import { Sentence } from '@prisma/client';

@Injectable()
export class SentenceService {
    constructor(private prismaService: PrismaService) { }

    async create(createSentenceDto: CreateSentenceDto) {
        try {
            let { topicId, typeId, content, mean, note, userId } = createSentenceDto
            const isExisted = await this.isExisted(createSentenceDto.content)
            if (isExisted) return new ResponseData<string>(null, 400, 'Câu đã tồn tại')
            topicId = topicId.map((id) => Number(id))
            topicId = topicId.filter((id) => id !== 0)
            const sentence = await this.prismaService.sentence.create({
                data: {
                    typeId: typeId,
                    userId: userId,
                    content: content,
                    mean: mean,
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
            return new ResponseData<Sentence>(sentence, 200, 'Tạo câu thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async findAll(option: { topic: [], type?: number, page: number, sort?: any }) {
        let pageSize = PAGE_SIZE.PAGE_SENTENCE
        try {
            let { sort, type, topic, page } = option

            const whereClause: any = {
                Topic: {},
            };

            if (topic) {
                if (topic.length > 1) {
                    whereClause.Topic = {
                        some: { id: { in: topic.map(topic => Number(topic)) } }
                    };
                } else {
                    whereClause.Topic = {
                        some: { id: Number(topic) }
                    };
                }
            }

            if (type) {
                whereClause.typeId = Number(type);
            }

            const totalCount = await this.prismaService.sentence.count({
                where: whereClause,
            });

            let totalPages = Math.ceil(totalCount / pageSize)
            if (!totalPages) totalPages = 1
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
                    Practice: true,
                    Topic: true,
                    Type: true
                }
            })
            return new ResponseData<any>({ sentences, totalPages }, 200, 'Tìm thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async findOne(id: number) {
        try {
            const sentence = await this.findById(id)
            if (!sentence) return new ResponseData<string>(null, 400, 'Câu không tồn tại')
            return new ResponseData<Sentence>(sentence, 200, 'Tìm thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async update(id: number, updateSentenceDto: UpdateSentenceDto) {
        try {
            let { typeId, content, mean, note, topicId } = updateSentenceDto
            const sentence = await this.findById(id)
            if (!sentence) return new ResponseData<string>(null, 400, 'Câu không tồn tại')
            if (content && sentence.content !== content) {
                const isExisted = await this.isExisted(content)
                if (isExisted) return new ResponseData<string>(null, 400, 'Câu này đã tồn tại')
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
                    mean,
                    note,
                    Topic: { connect: topicId.map((id) => ({ id })) }
                },
                include: {
                    Practice: true,
                    Topic: true,
                    Type: true
                }
            })
            return new ResponseData<Sentence>(newSentence, 200, 'Cập nhật thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async delete(id: number) {
        try {
            const sentence = await this.findById(id)
            if (!sentence) return new ResponseData<string>(null, 400, 'Câu không tồn tại')
            return new ResponseData<Sentence>(await this.prismaService.sentence.delete({ where: { id: id } }), 200, 'Xóa thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async isExisted(content: string) {
        const centence = await this.prismaService.sentence.findFirst({
            where: {
                content: {
                    equals: content,
                    mode: 'insensitive'
                }
            }
        })
        if (centence) return true
        return false
    }

    async findById(id: number) {
        return await this.prismaService.sentence.findUnique({
            where: {
                id: id
            },
            include: {
                Practice: true,
                User: true,
                Topic: true,
                Type: true
            }
        })
    }
}