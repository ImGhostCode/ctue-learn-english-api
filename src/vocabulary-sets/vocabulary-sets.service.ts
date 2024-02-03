import { Injectable } from '@nestjs/common';
import { CreateVocaSetDto, UpdateVocaSetDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { VocabularySet } from '@prisma/client';
import { ACCOUNT_TYPES, ResponseData } from 'src/global';


@Injectable()
export class VocabularySetsService {

    constructor(private readonly prismaService: PrismaService, private readonly cloudinaryService: CloudinaryService) { }

    async create(userId: number, accountType: string, createVocaSetDto: CreateVocaSetDto, pictureFile: Express.Multer.File) {
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
                    isPublic: accountType === ACCOUNT_TYPES.ADMIN ? true : false
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

    async findAllByUser(userId: number, option: { spec: number; topic: number; key: string; }) {
        try {
            let { spec, topic, key } = option
            let whereCondition: any = {
                title: { contains: key },
                isDeleted: false
            };
            if (topic) whereCondition.topicId = Number(topic);
            if (spec) whereCondition.specId = Number(spec);

            const res: any = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    UserVocabularySets: { where: whereCondition }
                }
            })
            return new ResponseData<VocabularySet>(res.VocabularySet, 200, 'Tìm thành công')
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
    async update(id: number, updateVocaSetDto: UpdateVocaSetDto, newPictureFile: Express.Multer.File) {
        try {
            let { title, topicId = null, specId = null, words = [], picture = null, oldPicture = null } = updateVocaSetDto

            picture = oldPicture
            // if (picture) picture = picture.filter(pic => pic !== '')
            if (newPictureFile) {
                const file = await this.cloudinaryService.uploadFile(newPictureFile)
                picture = file.url
            }

            const res = await this.prismaService.vocabularySet.update({
                where: {
                    id: id,
                }, data: {

                    title,
                    topicId,
                    specId,
                    picture,
                    words: {
                        set: [],
                        connect: words.map(id => ({ id: Number(id) }))
                    }
                }, include: {
                    Specialization: true
                    , Topic: true,
                    words: true
                }
            })
            return new ResponseData<VocabularySet>(res, 200, 'Cập nhật thành công')
        } catch (error) {
            console.log(error);

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
