import { Injectable } from '@nestjs/common';
import { CreateSenContributionDto, CreateWordContributionDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { CONSTANTS_MAX, CONTRIBUTION, ResponseData } from '../global';
import { Account, Contribution } from '@prisma/client';
import { WordService } from '../word/word.service';
import { SentenceService } from '../sentence/sentence.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ContributionService {
  constructor(private prismaService: PrismaService, private wordService: WordService, private sentenceService: SentenceService, private cloudinaryService: CloudinaryService) { }

  async createWordCon(createWordContributionDto: CreateWordContributionDto, userId: number, pictureFiles: Express.Multer.File[]) {

    // const { levelId, specializationId, content, means, note = '' } = createWordContributionDto.content
    try {
      if (pictureFiles) {
        const files = await Promise.all(
          pictureFiles.map(file => this.cloudinaryService.uploadFile(file))
        );
        createWordContributionDto.content.pictures = files.map(file => file.url)
      }


      const contribution = await this.prismaService.contribution.create({
        data: {
          userId: userId,
          content: JSON.parse(JSON.stringify(createWordContributionDto.content)),
          type: createWordContributionDto.type,
          status: Number(CONTRIBUTION.PENDING)
        }
      })
      return new ResponseData<Contribution>(contribution, 200, 'Gửi yêu cầu đóng góp thành công')
    } catch (error) {
      console.log(error);

      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async createSenCon(createSenContributionDto: CreateSenContributionDto, userId: number) {
    // const { content, meaning, note, typeId } = createSenContributionDto.content
    try {
      const contribution = await this.prismaService.contribution.create({
        data: {
          userId: userId,
          content: JSON.parse(JSON.stringify(createSenContributionDto.content)),
          type: createSenContributionDto.type,
          status: Number(CONTRIBUTION.PENDING)
        }
      })
      return new ResponseData<Contribution>(contribution, 200, 'Gửi yêu cầu đóng góp thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findAll(type: string, status: number) {
    try {
      let contributions = await this.prismaService.contribution.findMany({ where: { type, status, isDeleted: false } })
      //contributions.forEach((contribution) => contribution.content = JSON.parse(contribution.content as string))
      return new ResponseData<Contribution>(contributions, 200, 'Tìm thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findAllByUser(type: string, userId: number) {
    try {
      let contributions = await this.prismaService.contribution.findMany({ where: { userId, type, isDeleted: false } })
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

  async verifyWordContribution(id: number, body: { status: number, feedback: string }) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) {
        return new ResponseData<string>(null, 400, 'Đóng góp không tồn tại')
      }
      if (contribution.status !== CONTRIBUTION.PENDING) {
        return new ResponseData<string>(null, 400, "Đóng góp đã được duyệt")
      }
      if (body.status === CONTRIBUTION.APPROVED) {
        const { topicId = [], levelId, specializationId, content, means = [], note, phonetic, examples = [], synonyms = [], antonyms = [], pictures = [] } = JSON.parse(JSON.stringify(contribution.content))
        const { userId } = contribution

        const result = await this.wordService.create({ topicId: topicId.map(id => Number(id)), levelId, specializationId, content, means, note, phonetic, synonyms, antonyms, userId, examples, pictures }, null)

        if (result.statusCode === 200) {
          await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: '' } })
          return new ResponseData<{}>(result.data, 200, 'Duyệt thành công')
        }
      } else if (body.status === CONTRIBUTION.REFUSED) {
        await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: body.feedback } })
        return new ResponseData<string>(null, 200, 'Từ chối thành công')
      }
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }


  async verifySenContribution(id: number, body: { status: number, feedback: string }) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) {
        return new ResponseData<string>(null, 400, 'Đóng góp không tồn tại')
      }
      if (contribution.status !== CONTRIBUTION.PENDING) {
        return new ResponseData<string>(null, 400, "Đóng góp đã được duyệt")
      }
      if (body.status === CONTRIBUTION.APPROVED) {
        const { topicId = [], content, meaning: mean, note, typeId } = JSON.parse(JSON.stringify(contribution.content))
        const { userId } = contribution

        const result = await this.sentenceService.create({ topicId: topicId.map(id => Number(id)), content, mean, note, userId, typeId })

        if (result.statusCode === 200) {
          await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: '' } })
          return new ResponseData<{}>(result.data, 200, 'Duyệt thành công')
        }
      } else if (body.status === CONTRIBUTION.REFUSED) {
        await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: body.feedback } })
        return new ResponseData<string>(null, 200, 'Từ chối thành công')
      }
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async remove(id: number, account: Account) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) return new ResponseData<Contribution>(null, 400, 'Đóng góp không tồn tại')
      // if (account.accountType === 'user') {
      //   if (contribution.userId !== account.userId) return new ResponseData<Contribution>(null, 400, 'Không có quyền hạn để xóa')
      // }
      return new ResponseData<Contribution>(await this.prismaService.contribution.delete({ where: { id } }), 200, 'Xóa thành công')
    } catch (error) {
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async findById(id: number) {
    const contribution = await this.prismaService.contribution.findUnique({ where: { id: id, isDeleted: false } })
    if (!contribution) return null
    //contribution.content = JSON.parse(contribution.content as string)
    return contribution
  }
}