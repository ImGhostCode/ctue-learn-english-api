import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateVocaSetDto, UpdateVocaSetDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Account, UserLearnedWord, VocabularySet } from '@prisma/client';
import { ACCOUNT_TYPES, PAGE_SIZE, ResponseData } from 'src/global';


@Injectable()
export class VocabularySetsService {

    constructor(private readonly prismaService: PrismaService, private readonly cloudinaryService: CloudinaryService) { }

    async create(userId: number, createVocaSetDto: CreateVocaSetDto, pictureFile: Express.Multer.File) {
        try {
            let { title, topicId = null, specId = null, picture = null, words = [] } = createVocaSetDto

            if (words) {
                words = words.map(id => Number(id))
            }

            if (pictureFile) {
                const file = await this.cloudinaryService.uploadFile(pictureFile)
                picture = file.url
            }
            let createdVocaSet: VocabularySet | null = null
            const data: any = {
                title, userId, picture, isPublic: false, words: {
                    connect: words.map(id => ({ id }))
                },
            }
            if (topicId) data.topicId = topicId
            if (specId) data.specId = specId
            if (picture) data.picture = picture

            await this.prismaService.$transaction(async (tx) => {
                createdVocaSet = await this.prismaService.vocabularySet.create({
                    data: data,
                    include: {
                        Topic: true,
                        Specialization: true,
                        words: true,

                    },

                })

                await this.prismaService.userVocabularySet.create({
                    data: {
                        userId,
                        vocabularySetId: createdVocaSet.id
                    }
                })
            });


            return new ResponseData<VocabularySet>(createdVocaSet, HttpStatus.CREATED, 'Tạo bộ từ thành công')
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async downloadVocaSet(id: number, userId: number) {
        try {
            const result = await this.prismaService.$transaction(async (prisma) => {
                const vocabularySet = await prisma.vocabularySet.findUnique({ where: { id } });

                if (!vocabularySet) {
                    throw new HttpException('Bộ từ không tồn tại', HttpStatus.NOT_FOUND);
                }

                if (vocabularySet.userId === userId) {
                    throw new HttpException('Bạn đã sở hữu bộ từ này', HttpStatus.CONFLICT);
                }

                const isDownloaded = await prisma.userVocabularySet.findFirst({
                    where: {
                        userId,
                        vocabularySetId: id,
                    },
                });

                if (isDownloaded) {
                    throw new HttpException('Bạn đã tải bộ từ này', HttpStatus.CONFLICT);
                }

                await prisma.userVocabularySet.create({
                    data: {
                        userId,
                        vocabularySetId: id
                    }
                })

                const updatedVocabularySet = await prisma.vocabularySet.update({
                    where: { id },
                    data: {
                        downloads: {
                            increment: 1,
                        },
                    },
                });

                return new ResponseData<VocabularySet>(updatedVocabularySet, HttpStatus.OK, 'Tải bộ từ thành công');
            });

            return result;
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
            ;
        }
    }

    async rmDownloadedVocaSet(id: number, userId: number) {
        try {
            const res: any = await this.prismaService.userVocabularySet.delete({
                where: {
                    userId_vocabularySetId: {
                        userId,
                        vocabularySetId: id
                    }
                }
                , select: { VocabularySet: true }
            })
            return new ResponseData<VocabularySet>(res.VocabularySet, HttpStatus.OK, 'Xóa bộ từ thành công');
        } catch (error) {
            console.log(error);
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
            ;
        }
    }

    async findAllPublicVocaSet(option: {
        spec: number;
        topic: number;
        key: string;
    },) {
        try {
            let { spec, topic, key } = option
            let whereCondition: any = {
                title: { contains: key },
                isPublic: true,
                isDeleted: false
            };
            if (topic) whereCondition.topicId = Number(topic);
            if (spec) whereCondition.specId = Number(spec);

            const res = await this.prismaService.vocabularySet.findMany({
                where: whereCondition, include: {
                    words: true, Specialization: true, Topic: true
                }
            })

            return new ResponseData<{ results: VocabularySet[] }>({ results: res }, HttpStatus.OK, 'Tìm thành công')
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
                title: { contains: key },

                isDeleted: false
            };
            if (topic) whereCondition.topicId = Number(topic);
            if (spec) whereCondition.specId = Number(spec);

            const totalCount = await this.prismaService.vocabularySet.count({
                where: whereCondition
            })

            const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)
            if (!page || page < 1) page = 1
            if (page > totalPages) page = totalPages
            let next = (page - 1) * pageSize


            const res = await this.prismaService.vocabularySet.findMany({
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
            const createdVocaSets: any = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    CreatedVocabularySet: {
                        where: {
                            isDeleted: false
                        }

                    },
                }
            })

            const downloadedVocaSets: any = await this.prismaService.userVocabularySet.findMany({
                where: {
                    userId: userId,
                    vocabularySetId: {
                        notIn: createdVocaSets.CreatedVocabularySet.map(set => set.id)
                    },
                    VocabularySet: {
                        isDeleted: false
                    }
                },
                select: {
                    VocabularySet: true
                },

            });
            return new ResponseData<{ results: VocabularySet[] }>({ results: [...createdVocaSets.CreatedVocabularySet, ...downloadedVocaSets.map(set => set.VocabularySet)] }, HttpStatus.OK, 'Tìm thành công')
        } catch (error) {
            console.log(error);

            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAdminVocaSets() {
        return this.prismaService.vocabularySet.findMany({
            where: {
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
            const res = await this.prismaService.vocabularySet.findUnique({
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
            return new ResponseData<VocabularySet>(res, HttpStatus.OK, 'Tìm thành công')
        } catch (error) {
            console.log(error);
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }
    async update(id: number, updateVocaSetDto: UpdateVocaSetDto, newPictureFile: Express.Multer.File, account: Account) {
        try {
            let { title, topicId = null, specId = null, words = [], picture = null, oldPicture = null, isPublic = false } = updateVocaSetDto
            if (account.accountType === ACCOUNT_TYPES.USER) {
                const isOwner = await this.prismaService.vocabularySet.findUnique({ where: { id, userId: account.userId, isDeleted: false } })
                if (!isOwner) {
                    throw new HttpException('Bộ từ không tồn tại hoặc không thể chỉnh sửa', HttpStatus.NOT_ACCEPTABLE);
                }
            }

            picture = newPictureFile ? (await this.cloudinaryService.uploadFile(newPictureFile)).url : oldPicture;

            const whereCondition: any = {
                id: id,
            }
            const data: any = {
                title,
                //  topicId,
                //  specId,
                picture,
                //  words: {
                //     set: [],
                //connect: words.map(id => ({ id: Number(id) }))
                //}
            }
            if (topicId) data.topicId = topicId;
            if (specId) data.specId = specId;
            if (words) data.words = {
                set: [],
                connect: words.map(id => ({ id: Number(id) }))
            };


            if (account.accountType === ACCOUNT_TYPES.USER) {
                whereCondition.userId = account.userId

            } else if (account.accountType === ACCOUNT_TYPES.ADMIN) {
                data.isPublic = isPublic === 'true' ? true : false
            }

            const res = await this.prismaService.vocabularySet.update({
                where: whereCondition, data: data, include: {
                    Specialization: true
                    , Topic: true,
                    words: true
                }
            })
            return new ResponseData<VocabularySet>(res, HttpStatus.OK, 'Cập nhật thành công')
        } catch (error) {

            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }
    async remove(id: number) {
        try {
            const vocaSet = await this.findOne(id)
            if (!vocaSet) throw new HttpException('Bộ từ không tồn tại', HttpStatus.NOT_FOUND);

            return new ResponseData<VocabularySet>(await this.prismaService.vocabularySet.delete({ where: { id: id } }), HttpStatus.OK, 'Xóa thành công')
        } catch (error) {
            console.log(error);
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }
}
