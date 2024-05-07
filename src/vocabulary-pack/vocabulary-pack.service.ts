import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateVocabPackDto, UpdateVocabPackDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Account, VocabularyPack } from '@prisma/client';
import { ACCOUNT_TYPES, PAGE_SIZE, ResponseData } from 'src/global';


@Injectable()
export class VocabularyPackService {

    constructor(private readonly prismaService: PrismaService, private readonly cloudinaryService: CloudinaryService) { }

    async create(account: Account, createVocabPackDto: CreateVocabPackDto, pictureFile: Express.Multer.File) {
        try {
            let { title, topicId = null, specId = null, picture = null, words = [] } = createVocabPackDto

            if (words) {
                words = words.map(id => Number(id))
            }

            if (pictureFile) {
                const file = await this.cloudinaryService.uploadFile(pictureFile)
                picture = file.url
            }
            let createdVocabPack: VocabularyPack | null = null
            const data: any = {
                title, isPublic: false, words: {
                    connect: words.map(id => ({ id }))
                },
            }

            data.userId = account.userId

            if (topicId) data.topicId = topicId
            if (specId) data.specId = specId
            if (picture) data.picture = picture

            await this.prismaService.$transaction(async (tx) => {
                createdVocabPack = await this.prismaService.vocabularyPack.create({
                    data: data,
                    include: {
                        Topic: true,
                        Specialization: true,
                        words: true,

                    },
                })

                if (account.accountType === ACCOUNT_TYPES.USER) {
                    await this.prismaService.userVocabularyPack.create({
                        data: {
                            userId: account.userId,
                            vocabularyPackId: createdVocabPack.id
                        }
                    })
                }
            });
            return new ResponseData<VocabularyPack>(createdVocabPack, HttpStatus.CREATED, 'Tạo bộ từ thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async downloadVocabPack(id: number, userId: number) {
        try {
            const result = await this.prismaService.$transaction(async (prisma) => {
                const vocabularyPack = await prisma.vocabularyPack.findUnique({ where: { id, isDeleted: false } });

                if (!vocabularyPack) {
                    throw new HttpException('Bộ từ không tồn tại', HttpStatus.NOT_FOUND);
                }

                if (vocabularyPack.userId === userId) {
                    throw new HttpException('Bạn đã sở hữu bộ từ này', HttpStatus.CONFLICT);
                }

                const isDownloaded = await prisma.userVocabularyPack.findFirst({
                    where: {
                        userId,
                        vocabularyPackId: id,
                        isDeleted: false
                    },
                });

                if (isDownloaded) {
                    throw new HttpException('Bạn đã tải bộ từ này', HttpStatus.CONFLICT);
                }

                await prisma.userVocabularyPack.create({
                    data: {
                        userId,
                        vocabularyPackId: id
                    }
                })

                const updatedVocabularyPack = await prisma.vocabularyPack.update({
                    where: { id },
                    data: {
                        downloads: {
                            increment: 1,
                        },
                    },
                });

                return new ResponseData<VocabularyPack>(updatedVocabularyPack, HttpStatus.OK, 'Tải bộ từ thành công');
            });

            return result;
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
            ;
        }
    }

    async rmDownloadedVocabPack(id: number, userId: number) {
        try {
            const res: any = await this.prismaService.userVocabularyPack.delete({
                where: {
                    userId_vocabularyPackId: {
                        userId,
                        vocabularyPackId: id
                    }
                }
                , select: { VocabularyPack: true }
            })
            return new ResponseData<VocabularyPack>(res.VocabularyPack, HttpStatus.OK, 'Xóa bộ từ thành công');
        } catch (error) {
            console.log(error);
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
            ;
        }
    }

    async findAllPublicVocabPack(option: {
        spec: number;
        topic: number;
        key: string;
    },) {
        try {
            let { spec, topic, key } = option
            let whereCondition: any = {
                title: { contains: key, mode: 'insensitive' },
                isPublic: true,
                isDeleted: false
            };
            if (topic) whereCondition.topicId = Number(topic);
            if (spec) whereCondition.specId = Number(spec);

            const res = await this.prismaService.vocabularyPack.findMany({
                where: whereCondition, include: {
                    words: true, Specialization: true, Topic: true
                }
            })

            return new ResponseData<{ results: VocabularyPack[] }>({ results: res }, HttpStatus.OK, 'Tìm thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async findAllByAdmin(option: {
        spec: number,
        topic: number,
        key: string,
        page: number
    },) {
        let pageSize = PAGE_SIZE.PAGE_USER
        try {
            let { spec, topic, key, page } = option
            let whereCondition: any = {
                title: { contains: key, mode: 'insensitive' },

                isDeleted: false
            };
            if (topic) whereCondition.topicId = Number(topic);
            if (spec) whereCondition.specId = Number(spec);

            const totalCount = await this.prismaService.vocabularyPack.count({
                where: whereCondition
            })

            const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)
            if (!page || page < 1) page = 1
            if (page > totalPages) page = totalPages
            let next = (page - 1) * pageSize


            const res = await this.prismaService.vocabularyPack.findMany({
                skip: next,
                take: pageSize,
                where: whereCondition, include: {
                    Specialization: true, Topic: true, words: true
                }
            })

            return new ResponseData<any>({ data: res, totalPages, total: totalCount }, HttpStatus.OK, 'Tìm thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async findAllByUser(userId: number) {
        try {
            const createdVocabPacks: any = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    CreatedVocabularyPack: {
                        where: {
                            isDeleted: false
                        }
                    },
                }
            })

            const createdVocabPackIds = createdVocabPacks.CreatedVocabularyPack
                .map(set => set.id)
                .filter(id => id !== undefined);

            createdVocabPacks.CreatedVocabularyPack = await this.prismaService.userVocabularyPack.findMany({
                where: {
                    isDeleted: false,
                    userId: userId,
                    vocabularyPackId: {
                        in: createdVocabPackIds
                    }
                },
                select: {
                    VocabularyPack: true
                },
            })

            const downloadedVocabPacks: any = await this.prismaService.userVocabularyPack.findMany({
                where: {
                    isDeleted: false,
                    userId: userId,
                    vocabularyPackId: {
                        notIn: createdVocabPacks.CreatedVocabularyPack.map(set => set.VocabularyPack.id)
                    },
                    VocabularyPack: {
                        isDeleted: false
                    }
                },
                select: {
                    VocabularyPack: true
                },

            });
            return new ResponseData<{ results: VocabularyPack[] }>({ results: [...createdVocabPacks.CreatedVocabularyPack.map(set => set.VocabularyPack), ...downloadedVocabPacks.map(set => set.VocabularyPack)] }, HttpStatus.OK, 'Tìm thành công')
        } catch (error) {
            console.log(error);
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAdminVocabPacks() {
        return this.prismaService.vocabularyPack.findMany({
            where: {
                isDeleted: false,
                User: {
                    Account: {
                        every: {
                            accountType: ACCOUNT_TYPES.ADMIN
                        }
                    }
                }
            }
        })
    }


    async findOne(id: number) {
        try {
            const res = await this.prismaService.vocabularyPack.findUnique({
                where: { id: id, isDeleted: false }, include: {
                    words: {
                        include: {
                            Level: true,
                            Specialization: true,
                            Topic: true,
                            meanings: {
                                include: {
                                    Type: true
                                }
                            }
                        }
                    }
                }
            })
            return new ResponseData<VocabularyPack>(res, HttpStatus.OK, 'Tìm thành công')
        } catch (error) {
            console.log(error);
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }
    async update(id: number, updateVocabPackDto: UpdateVocabPackDto, newPictureFile: Express.Multer.File, account: Account) {
        try {
            let { title, topicId = null, specId = null, words, oldWords, picture = null, oldPicture = null, isPublic = false } = updateVocabPackDto
            if (account.accountType === ACCOUNT_TYPES.USER) {
                const isOwner = await this.prismaService.vocabularyPack.findUnique({ where: { id, userId: account.userId, isDeleted: false } })
                if (!isOwner) {
                    throw new HttpException('Bộ từ không tồn tại hoặc không thể chỉnh sửa', HttpStatus.NOT_ACCEPTABLE);
                }
            }

            picture = newPictureFile ? (await this.cloudinaryService.uploadFile(newPictureFile)).url : oldPicture;

            const whereCondition: any = {
                id: id,
            }
            const dataUpdate: any = {
                title,
                //  topicId,
                //  specId,
                picture,
                //  words: {
                //     set: [],
                //connect: words.map(id => ({ id: Number(id) }))
                //}
            }

            if (topicId != null && specId == null) {
                dataUpdate.topicId = topicId;
                dataUpdate.specId = null;
            }
            if (specId != null && topicId == null) {
                dataUpdate.specId = specId;
                dataUpdate.topicId = null;
            }
            if (words) {
                words = words.map(id => Number(id))
                dataUpdate.words = {
                    set: [],
                    connect: words.map(id => ({ id: id }))
                };

            }

            let deletedWords = []

            if (words) {
                oldWords = oldWords.map(id => Number(id))
                deletedWords = oldWords.filter(id => !words.includes(id))
            }


            if (account.accountType === ACCOUNT_TYPES.USER) {
                whereCondition.userId = account.userId

            } else if (account.accountType === ACCOUNT_TYPES.ADMIN) {
                dataUpdate.isPublic = isPublic === 'true' ? true : false
            }

            // how to get ids of review reminders to modify
            const reviewReminderToWordRows = []
            if (deletedWords.length > 0) {
                const reviewReminderIds = await this.prismaService.reviewReminder.findMany({ where: { vocabularyPackId: id, words: { some: { id: { in: deletedWords } } } }, select: { id: true } })
                deletedWords.forEach(wordId => {
                    reviewReminderIds.forEach(reminderId => {
                        reviewReminderToWordRows.push(this.prismaService.$queryRaw`DELETE FROM "_ReviewReminderToWord" WHERE "A" = ${reminderId.id} AND "B" = ${wordId}`)
                    })
                })
            }

            const jobs: any = [this.prismaService.vocabularyPack.update({
                where: whereCondition,
                data: {
                    ...dataUpdate,
                },
                include: {
                    Specialization: true,
                    Topic: true,
                    words: true
                }
            }),]

            if (words) {
                jobs.push(
                    this.prismaService.userLearnedWord.deleteMany({ where: { vocabularyPackId: id, wordId: { in: deletedWords } } }),
                    ...(words.length === 0 ? [
                        this.prismaService.reviewReminder.deleteMany({ where: { vocabularyPackId: id } })
                    ] : reviewReminderToWordRows)
                )
            }

            const [res, res2, res3] = await this.prismaService.$transaction(jobs)

            // delete review reminders if no words in the review reminders
            await this.prismaService.reviewReminder.deleteMany({ where: { vocabularyPackId: id, words: { none: {} } } });

            return new ResponseData<VocabularyPack>(res, HttpStatus.OK, 'Cập nhật thành công')
        } catch (error) {
            console.log(error);

            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id: number) {
        try {
            const vocabPack = await this.findOne(id)
            if (!vocabPack) throw new HttpException('Bộ từ không tồn tại', HttpStatus.NOT_FOUND);

            const [deletedVocabPack] = await this.prismaService.$transaction([
                this.prismaService.vocabularyPack.delete({ where: { id: id } }),
                this.prismaService.userVocabularyPack.deleteMany({ where: { vocabularyPackId: id } }),
                this.prismaService.reviewReminder.deleteMany({ where: { vocabularyPackId: id } }),
                this.prismaService.userLearnedWord.deleteMany({ where: { vocabularyPackId: id } })
            ])

            return new ResponseData<VocabularyPack>(deletedVocabPack, HttpStatus.OK, 'Xóa thành công')
        } catch (error) {
            console.log(error);
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }
}
