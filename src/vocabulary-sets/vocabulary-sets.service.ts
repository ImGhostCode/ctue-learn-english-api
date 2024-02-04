import { Injectable } from '@nestjs/common';
import { CreateVocaSetDto, UpdateVocaSetDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Account, VocabularySet } from '@prisma/client';
import { ACCOUNT_TYPES, ResponseData } from 'src/global';


@Injectable()
export class VocabularySetsService {

    constructor(private readonly prismaService: PrismaService, private readonly cloudinaryService: CloudinaryService) { }

    async create(userId: number, createVocaSetDto: CreateVocaSetDto, pictureFile: Express.Multer.File) {
        try {
            let { title, topicId = null, specId = null, picture, words = [] } = createVocaSetDto

            if (words) {
                words = words.map(id => Number(id))
            }

            if (pictureFile) {
                const file = await this.cloudinaryService.uploadFile(pictureFile)
                picture = file.url
            }
            const res = await this.prismaService.vocabularySet.create({
                data: {
                    title,
                    userId,
                    topicId,
                    specId,
                    picture,
                    words: {
                        connect: words.map(id => ({ id }))
                    },
                    isPublic: false
                },
                include: {
                    Topic: true,
                    Specialization: true,
                    words: true
                }
            })
            return new ResponseData<VocabularySet>(res, 200, 'Tạo bộ từ thành công')
        } catch (error) {
            console.log(error);
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async downloadVocaSet(id: number, userId: number) {
        try {
            const result = await this.prismaService.$transaction(async (prisma) => {
                const vocabularySet = await prisma.vocabularySet.findUnique({ where: { id } });

                if (!vocabularySet) {
                    throw new Error('Bộ từ không tồn tại');
                }

                if (vocabularySet.userId === userId) {
                    return new ResponseData<VocabularySet>(null, 400, 'Bạn đã sở hữu bộ từ này');
                }

                const isDownloaded = await prisma.userVocabularySet.findFirst({
                    where: {
                        vocabularySetId: id,
                    },
                });

                if (isDownloaded) {
                    return new ResponseData<VocabularySet>(null, 400, 'Bạn đã tải bộ từ này');
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

                return new ResponseData<VocabularySet>(updatedVocabularySet, 200, 'Tải bộ từ thành công');
            });

            return result;
        } catch (error) {
            console.log(error);
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau');
        }
    }

    async rmDownloadedVocaSet(id: number, userId: number) {
        try {
            const res: any = await this.prismaService.userVocabularySet.delete({
                where: { id, userId }
            })
            return new ResponseData<VocabularySet>(res, 200, 'Xóa bộ từ thành công');
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau');
        }
    }

    async findAll(option: {
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

            const res = await this.prismaService.vocabularySet.findMany({ where: whereCondition })

            return new ResponseData<VocabularySet>(res, 200, 'Tìm thành công')
        } catch (error) {
            console.log(error);
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async findAllByUser(userId: number) {
        try {
            const createdVocaSets: any = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    CreatedVocabularySet: true,
                }
            })

            const downloadedVocaSets: any = await this.prismaService.userVocabularySet.findMany({
                where: {
                    userId: userId,
                },
                select: {
                    VocabularySet: true,
                },
            });
            return new ResponseData<any>({ createdVocaSets, downloadedVocaSets }, 200, 'Tìm thành công')
        } catch (error) {
            console.log(error);
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }

    async findOne(id: number) {
        try {
            const res = await this.prismaService.vocabularySet.findUnique({ where: { id: id, isDeleted: false } })
            return new ResponseData<VocabularySet>(res, 200, 'Tìm thành công')
        } catch (error) {
            console.log(error);
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }
    async update(id: number, updateVocaSetDto: UpdateVocaSetDto, newPictureFile: Express.Multer.File, account: Account) {
        try {
            let { title, topicId = null, specId = null, words = [], picture = null, oldPicture = null, isPublic = false } = updateVocaSetDto

            if (account.accountType === ACCOUNT_TYPES.USER) {
                const isOwner = await this.prismaService.vocabularySet.findUnique({ where: { id, userId: account.userId } })
                if (!isOwner) {
                    return new ResponseData<VocabularySet>(null, 400, 'Bộ từ không tồn tại hoặc không thể chỉnh sửa')
                }
            }

            picture = newPictureFile ? (await this.cloudinaryService.uploadFile(newPictureFile)).url : oldPicture;

            const whereCondition: any = {
                id: id,
            }
            const data: any = {
                title,
                topicId,
                specId,
                picture,
                words: {
                    set: [],
                    connect: words.map(id => ({ id: Number(id) }))
                }
            }

            if (account.accountType === ACCOUNT_TYPES.USER) {
                whereCondition.userId = account.userId

            } else {
                data.isPublic = isPublic
            }

            const res = await this.prismaService.vocabularySet.update({
                where: whereCondition, data: data, include: {
                    Specialization: true
                    , Topic: true,
                    words: true
                }
            })
            return new ResponseData<VocabularySet>(res, 200, 'Cập nhật thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }
    async remove(id: number) {
        try {
            const vocaSet = await this.findOne(id)
            if (!vocaSet) return new ResponseData<string>(null, 400, 'Bộ từ không tồn tại')
            return new ResponseData<VocabularySet>(await this.prismaService.vocabularySet.delete({ where: { id: id } }), 200, 'Xóa thành công')
        } catch (error) {
            return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
        }
    }
}
