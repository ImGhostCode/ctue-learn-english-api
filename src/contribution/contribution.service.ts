import { Injectable } from '@nestjs/common';
import { CreateContributionDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { CONSTANTS_MAX, ResponseData } from '../global';
import { Account, Contribution } from '@prisma/client';
import { WordService } from '../word/word.service';
import { SentenceService } from '../sentence/sentence.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ContributionService {
  constructor(private prismaService: PrismaService, private wordService: WordService, private sentenceService: SentenceService, private cloudinaryService: CloudinaryService) { }

  async create(createContributionDto: CreateContributionDto, userId: number, pictureFile: Express.Multer.File) {

    const contentContribution = JSON.parse(String(createContributionDto.content))

    const { levelId, specializationId, content, mean, note } = contentContribution
    try {
      if (createContributionDto.type === 'word') {
        if (levelId === undefined || specializationId === undefined) {
          return new ResponseData<string>(null, 400, 'Thiếu tham số bắt buộc')
        }
        if (content.length > CONSTANTS_MAX.WORD_CONTENT_LEN || mean.length > CONSTANTS_MAX.WORD_MEAN_LEN || note.length > CONSTANTS_MAX.WORD_NOTE_LEN) {
          return new ResponseData<string>(null, 400, 'Độ dài các thuộc thính không phù hợp')
        }
      }
      if (createContributionDto.type === 'sentence') {
        if (content.length > CONSTANTS_MAX.SENTENCE_CONTENT_LEN || mean.length > CONSTANTS_MAX.SENTENCE_MEAN_LEN || note.length > CONSTANTS_MAX.SENTENCE_NOTE_LEN) {
          return new ResponseData<string>(null, 400, 'Độ dài các thuộc thính không phù hợp')
        }
      }

      if (createContributionDto.type === 'word') {
        const fileData = await this.cloudinaryService.uploadFile(pictureFile)
        contentContribution.picture = fileData.url
      }


      const contribution = await this.prismaService.contribution.create({
        data: {
          userId: userId,
          content: contentContribution,
          type: createContributionDto.type,
          status: -1
        }
      })
      return new ResponseData<Contribution>(contribution, 200, 'Tạo thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findAll(type: string, status: number) {
    try {
      let contributions = await this.prismaService.contribution.findMany({ where: { type, status } })
      //contributions.forEach((contribution) => contribution.content = JSON.parse(contribution.content as string))
      return new ResponseData<Contribution>(contributions, 200, 'Tìm thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findAllByUser(type: string, userId: number) {
    try {
      let contributions = await this.prismaService.contribution.findMany({ where: { userId, type } })
      // contributions.forEach((contribution) => contribution.content = JSON.parse(String(contribution.content)))
      return new ResponseData<Contribution>(contributions, 200, 'Tìm thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findOne(id: number) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) return new ResponseData<string>(null, 400, 'Đóng góp không tồn tại')
      return new ResponseData<Contribution>(contribution, 200, 'Tìm thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async verifyContribute(id: number, body: { status: number, feedback: string }) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) {
        return new ResponseData<string>(null, 400, 'Đóng góp không tồn tại')
      }
      if (contribution.status !== -1) {
        return new ResponseData<string>(null, 400, "Từ đã được xác minh")
      }
      if (body.status === 1) {
        const { typeId, topicId, levelId, specializationId, content, mean, note, phonetic, examples, synonyms, antonyms, picture } = JSON.parse(JSON.stringify(contribution.content))
        const { userId } = contribution
        let value: any
        if (contribution.type === 'word') {
          value = await this.wordService.create({ typeId, topicId: topicId.length ? topicId.map(id => Number(id)) : [], levelId, specializationId, content, mean, note, phonetic, synonyms: synonyms.split('\r\n'), antonyms: antonyms.split('\r\n'), userId, examples: examples.split('\r\n'), picture }, null)
        } else {
          value = await this.sentenceService.create({ typeId, topicId: topicId.map(id => Number(id)), content, mean, note, userId })
        }
        if (value.statusCode === 200) {
          await this.prismaService.contribution.update({ where: { id }, data: { status: body.status, feedback: '' } })
          return new ResponseData<string>(null, 200, 'Duyệt thành công')
        }
        return value
      } else if (body.status === 0) {
        await this.prismaService.contribution.update({ where: { id }, data: { status: body.status, feedback: body.feedback } })
        return new ResponseData<string>(null, 200, 'Từ chối thành công')
      }
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async remove(id: number, account: Account) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) return new ResponseData<Contribution>(null, 400, 'Đóng góp không tồn tại')
      if (account.accountType === 'user') {
        if (contribution.userId !== account.userId) return new ResponseData<Contribution>(null, 400, 'Không có quyền hạn để xóa')
      }
      return new ResponseData<Contribution>(await this.prismaService.contribution.delete({ where: { id } }), 200, 'Xóa thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findById(id: number) {
    const contribution = await this.prismaService.contribution.findUnique({ where: { id: id } })
    if (!contribution) return null
    //contribution.content = JSON.parse(contribution.content as string)
    return contribution
  }
}