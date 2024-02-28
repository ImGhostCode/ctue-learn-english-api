import { Injectable } from '@nestjs/common';
import { CreateWordDto, UpdateWordDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE, PRACTICE_SIZE, ResponseData } from '../global';
import { Word } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class WordService {
    constructor(private prismaService: PrismaService, private cloudinaryService: CloudinaryService) { }

    async create(createWordDto: CreateWordDto, pictureFiles: Express.Multer.File[]) {
        try {
            let { userId, topicId = [], levelId, specializationId, content, meanings = [], note, phonetic, examples = [], antonyms = [], synonyms = [], pictures = [] } = createWordDto

            const isExisted = await this.isExisted(createWordDto.content)
            if (isExisted) return new ResponseData<string>(null, 400, 'Từ đã tồn tại')
            if (pictureFiles) {
                const files = await Promise.all(
                    pictureFiles.map(file => this.cloudinaryService.uploadFile(file))
                );

                pictures = files.map(file => file.url)
            }
            if (topicId) {
                topicId = topicId.map((id) => Number(id))
            }

            // if (examples) examples = examples.filter(example => example !== '')
            // if (antonyms) antonyms = antonyms.filter(antonym => antonym !== '')
            // if (synonyms) synonyms = synonyms.filter(synonym => synonym !== '')

            const word = await this.prismaService.word.create({
                data: {
                    userId,
                    Topic: {
                        connect: topicId.map((id) => ({ id }))
                    },
                    levelId,
                    specializationId,
                    content,
                    meanings: {
                        create: [...meanings]
                    },
                    note,
                    phonetic,
                    examples,
                    antonyms,
                    synonyms,
                    pictures
                },
                include: {
                    Topic: true,
                    Specialization: true,
                    Level: true,
                    meanings: true
                }
            })

            return new ResponseData<Word>(word, 200, 'Tạo từ thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async findAll(option: { sort: any, type: number[], level: number, specialization: number, topic: [], page: number, key: string }) {
        let pageSize = PAGE_SIZE.PAGE_WORD
        try {

            let { sort, type, level, specialization, topic, page, key } = option
            let whereCondition: any = {
                OR: [
                    { content: { contains: key } },
                    // { meanings: { some: { contains: key } } }
                ],
                isDeleted: false
            };
            if (level) whereCondition.levelId = Number(level);
            if (specialization) whereCondition.specializationId = Number(specialization);
            if (type) {
                if (Array.isArray(type)) {
                    whereCondition.meanings = {
                        some: { typeId: { in: type.map(type => Number(type)) } }
                    };
                } else {
                    whereCondition.meanings = {
                        some: { typeId: Number(type) }
                    };
                }
            }
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
                    Specialization: true,
                    Level: true,
                    meanings: true
                }
            })
            return new ResponseData<any>({ results: words, totalPages }, 200, 'Tìm thành công')
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

    async update(id: number, updateWordDto: UpdateWordDto, newPictureFiles: Express.Multer.File[]) {
        try {
            let { topicId = [], levelId, specializationId, content, meanings = [], note, phonetic, examples = [], antonyms = [], synonyms = [], oldPictures = [] } = updateWordDto

            const word = await this.findById(id)
            if (!word) return new ResponseData<string>(null, 400, 'Từ không tồn tại')

            if (content !== word.content) {
                const isExisted = await this.isExisted(content)
                if (isExisted) return new ResponseData<string>(null, 400, 'Từ này đã tồn tại')
            }

            let pictures: string[] = oldPictures
            if (pictures) pictures = pictures.filter(pic => pic !== '')
            if (newPictureFiles && newPictureFiles.length > 0) {
                const files = await Promise.all(
                    newPictureFiles.map(file => this.cloudinaryService.uploadFile(file))
                );

                pictures = [...pictures, ...files.map(file => file.url)]
            }

            // if (examples) examples = examples.filter(example => example !== '')
            // if (antonyms) antonyms = antonyms.filter(antonym => antonym !== '')
            // if (synonyms) synonyms = synonyms.filter(synonym => synonym !== '')

            if (topicId) {
                await this.prismaService.word.update({
                    where: { id: id },
                    data: {
                        Topic: { disconnect: word.Topic.map((id) => id) }
                    }
                })
            }

            let meaningsToCreate: any[] = []
            if (meanings) {
                await this.prismaService.wordMeaning.deleteMany({
                    where: { wordId: id }
                });

                meaningsToCreate = meanings.map(mean => ({
                    // wordId: id,
                    typeId: mean.typeId,
                    meaning: mean.meaning
                }));
            }

            const data: any = {
                content,
                note,
                levelId,
                specializationId,
                meanings: {
                    create: [...meaningsToCreate]
                },
                phonetic,
                examples,
                antonyms,
                synonyms,
                Topic: { connect: topicId.map((id) => ({ id: Number(id) })) },
                pictures,
            }


            const newWord = await this.prismaService.word.update({
                where: { id: Number(id) }, // Specify the primary key for identifying the record
                data: data,
                include: {
                    Topic: true,
                    meanings: true,
                    Specialization: true,
                    Level: true
                }
            });

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
                id: id,
                isDeleted: false
            },
            include: {
                // Practice: true, 
                User: true, Topic: true, meanings: {
                    include: {
                        Type: true,
                    }
                }, Level: true, Specialization: true
            }
        })
    }

    async getWordsPack(userId, option: { types: number[], level: number, specialization: number, topic: [], numSentence: number }) {
        try {
            let { topic, types, level, specialization, numSentence } = option
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
                isDeleted: false
            };
            // if (type) whereCondition.typeId = Number(type);
            if (level) whereCondition.levelId = Number(level);
            if (specialization) whereCondition.specializationId = Number(specialization);
            if (types) {
                if (Array.isArray(types)) {
                    whereCondition.meanings = {
                        some: { typeId: { in: types.map(type => Number(type)) } }
                    };
                } else {
                    whereCondition.meanings = {
                        some: { typeId: Number(types) }
                    };
                }
            }
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
                include: { Topic: true, Level: true, Specialization: true, meanings: true }
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
                        // {
                        //     mean: { contains: key }
                        // }
                    ],
                    isDeleted: false
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
