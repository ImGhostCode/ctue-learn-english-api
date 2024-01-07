import { Injectable } from '@nestjs/common';
import { CreateWordDto, UpdateWordDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE, PRACTICE_SIZE, ResponseData } from '../global';
import { Word } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class WordService {
    constructor(private prismaService: PrismaService, private cloudinaryService: CloudinaryService) { }

    async create(createWordDto: CreateWordDto, pictureFile: Express.Multer.File) {
        try {
            let { userId, typeId, topicId, levelId, specializationId, content, mean, note, phonetic, examples, antonyms, synonyms, picture } = createWordDto
            const isExisted = await this.isExisted(createWordDto.content)
            if (isExisted) return new ResponseData<string>(null, 400, 'Từ đã tồn tại')
            if (pictureFile) {
                const file = await this.cloudinaryService.uploadFile(pictureFile)
                picture = file.url
            }
            if (topicId) {
                topicId = topicId.map((id) => Number(id))
            } else {
                topicId = []
            }
            if (examples) examples = examples.filter(example => example !== '')
            if (antonyms) antonyms = antonyms.filter(antonym => antonym !== '')
            if (synonyms) synonyms = synonyms.filter(synonym => synonym !== '')

            const word = await this.prismaService.word.create({
                data: {
                    userId,
                    typeId,
                    Topic: {
                        connect: topicId.map((id) => ({ id }))
                    },
                    levelId,
                    specializationId,
                    content,
                    mean,
                    note,
                    phonetic,
                    examples,
                    antonyms,
                    synonyms,
                    picture
                },
                include: {
                    Topic: true,
                    Type: true,
                    Specialization: true,
                    Level: true
                }
            })
            return new ResponseData<Word>(word, 200, 'Tạo từ thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async findAll(option: { sort: any, type: number, level: number, specialization: number, topic: [], page: number, key: string }) {
        let pageSize = PAGE_SIZE.PAGE_WORD
        try {
            let { sort, type, level, specialization, topic, page, key } = option
            let whereCondition: any = {
                OR: [
                    { content: { contains: key } },
                    { mean: { contains: key } }
                ]
            };
            if (type) whereCondition.typeId = Number(type);
            if (level) whereCondition.levelId = Number(level);
            if (specialization) whereCondition.specializationId = Number(specialization);
            if (topic) {
                if (topic.length > 1) {
                    whereCondition.Topic = {
                        some: { id: { in: topic.map(topic => Number(topic)) } }
                    };
                } else {
                    whereCondition.Topic = {
                        some: { id: Number(topic) }
                    };
                }
            }
            const totalCount = await this.prismaService.word.count({
                where: whereCondition
            })
            let totalPages = Math.ceil(totalCount / pageSize)
            if (!totalPages) totalPages = 1
            if (!page || page < 1) page = 1
            if (page > totalPages) page = totalPages
            let next = (page - 1) * pageSize
            const words = await this.prismaService.word.findMany({
                skip: next,
                take: pageSize,
                orderBy: {
                    content: sort
                },
                where: whereCondition,
                include: {
                    Topic: true,
                    Type: true,
                    Specialization: true,
                    Level: true
                }
            })
            return new ResponseData<any>({ words, totalPages }, 200, 'Tìm thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async findOne(id: number) {
        try {
            const word = await this.findById(id)
            if (!word) return new ResponseData<string>(null, 400, 'Từ không tồn tại')
            return new ResponseData<Word>(word, 200, 'Tìm thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async update(id: number, updateWordDto: UpdateWordDto, pictureFile: Express.Multer.File) {
        try {
            let { typeId, topicId, levelId, specializationId, content, mean, note, phonetic, examples, antonyms, synonyms } = updateWordDto
            const word = await this.findById(id)
            if (!word) return new ResponseData<string>(null, 400, 'Từ không tồn tại')
            let picture: string
            if (pictureFile) {
                const file = await this.cloudinaryService.uploadFile(pictureFile)
                picture = file.url
            }
            if (content && content !== word.content) {
                const isExisted = await this.isExisted(content)
                if (isExisted) return new ResponseData<string>(null, 400, 'Từ này đã tồn tại')
            }
            if (topicId) {
                topicId = topicId.map((id) => Number(id))
                await this.prismaService.word.update({
                    where: { id: id },
                    data: {
                        Topic: { disconnect: word.Topic.map((id) => id) }
                    }
                })
            } else {
                topicId = []
            }
            if (examples) examples = examples.filter(example => example !== '')
            if (antonyms) antonyms = antonyms.filter(antonym => antonym !== '')
            if (synonyms) synonyms = synonyms.filter(synonym => synonym !== '')
            const newWord = await this.prismaService.word.update({
                where: { id: id },
                data: {
                    typeId,
                    content,
                    mean,
                    note,
                    levelId,
                    specializationId,
                    phonetic,
                    examples,
                    antonyms,
                    synonyms,
                    Topic: { connect: topicId.map((id) => ({ id })) },
                    picture
                },
                include: {
                    Topic: true,
                    Type: true,
                    Specialization: true,
                    Level: true
                }
            })
            return new ResponseData<Word>(newWord, 200, 'Cập nhật thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async delete(id: number) {
        try {
            const word = await this.findById(id)
            if (!word) return new ResponseData<string>(null, 400, 'Từ không tồn tại')
            return new ResponseData<Word>(await this.prismaService.word.delete({ where: { id: id } }), 200, 'Xóa thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async isExisted(content: string) {
        const word = await this.prismaService.word.findFirst({
            where: {
                content: {
                    equals: content,
                    mode: 'insensitive'
                }
            }
        })
        if (word) return true
        return false
    }

    async findById(id: number) {
        return await this.prismaService.word.findUnique({
            where: {
                id: id
            },
            include: {
                Practice: true, User: true, Topic: true, Type: true, Level: true, Specialization: true
            }
        })
    }

    async getWordsPack(userId, option: { type: number, level: number, specialization: number, topic: [], numSentence: number }) {
        try {
            let { topic, type, level, specialization, numSentence } = option
            const userPractice = await this.prismaService.practice.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    Words: true,
                },
            });

            const wordReviewCounts = {};

            userPractice.forEach((practice) => {
                practice.Words.forEach((word) => {
                    if (word.id in wordReviewCounts) {
                        wordReviewCounts[word.id]++;
                    } else {
                        wordReviewCounts[word.id] = 1;
                    }
                });
            });

            const wordsOverReviewLimit = [];
            Object.keys(wordReviewCounts).forEach((wordId) => {
                if (wordReviewCounts[wordId] >= PRACTICE_SIZE.MAX_PRACTICE_COUNT) {
                    wordsOverReviewLimit.push(parseInt(wordId));
                }
            });

            let whereCondition: any = {
            };
            if (type) whereCondition.typeId = Number(type);
            if (level) whereCondition.levelId = Number(level);
            if (specialization) whereCondition.specializationId = Number(specialization);
            if (topic) {
                if (Array.isArray(topic) && topic.length > 1) {
                    whereCondition.Topic = {
                        some: { id: { in: topic.map(topic => Number(topic)) } }
                    };
                } else {
                    whereCondition.Topic = {
                        some: { id: Number(topic) }
                    };
                }
            }
            if (wordsOverReviewLimit.length) {
                whereCondition.id = {
                    notIn: wordsOverReviewLimit,
                }
            }
            const totalWordspack = await this.prismaService.word.count({
                where: whereCondition
            })
            if (totalWordspack <= Number(numSentence)) return new ResponseData<Word>(null, 400, 'Không đủ gói từ vựng');
            const maxRandomIndex = totalWordspack - Number(numSentence);
            const randomPackIndex = Math.floor(Math.random() * (maxRandomIndex + 1))
            const wordspack = await this.prismaService.word.findMany({
                where: whereCondition,
                take: Number(numSentence),
                skip: randomPackIndex,
                include: { Topic: true, Level: true, Specialization: true, Type: true }
            })
            return new ResponseData<Word>(wordspack, 200, 'Tìm gói từ vựng thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async lookUpDictionary(key: string) {
        try {
            const word = await this.prismaService.word.findMany({
                where: {
                    OR: [
                        {
                            content: { contains: key }
                        },
                        {
                            mean: { contains: key }
                        }
                    ]
                }
            })
            if (word.length === 0) {
                return new ResponseData<Word>([], 400, 'Không tìm thấy từ trong từ điển');
            }
            return new ResponseData<Word>(word, 200, 'Tìm thấy từ trong từ điển');
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }
}