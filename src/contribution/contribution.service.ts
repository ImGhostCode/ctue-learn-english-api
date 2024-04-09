import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSenContributionDto, CreateWordContributionDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { CONSTANTS_MAX, CONTRIBUTION, PAGE_SIZE, ResponseData } from '../global';
import { Account, Contribution, Sentence, Word } from '@prisma/client';
import { WordService } from '../word/word.service';
import { SentenceService } from '../sentence/sentence.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';


@Injectable()
export class ContributionService {

  constructor(private prismaService: PrismaService, private wordService: WordService, private sentenceService: SentenceService, private cloudinaryService: CloudinaryService, private notificationService: NotificationService) { }

  async createWordCon(createWordContributionDto: CreateWordContributionDto, userId: number, pictureFiles: Express.Multer.File[]) {

    // const { levelId, specializationId, content, meanings, note = '' } = createWordContributionDto.content
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
      return new ResponseData<Contribution>(contribution, HttpStatus.CREATED, 'Gửi yêu cầu đóng góp thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
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
      return new ResponseData<Contribution>(contribution, HttpStatus.CREATED, 'Gửi yêu cầu đóng góp thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(option: { page: number, type: string, status: number }) {
    let pageSize = PAGE_SIZE.PAGE_USER

    try {
      let { page,
        // type,
        // status
      } = option
      const totalCount = await this.prismaService.contribution.count({
        where: {
          // type, status: Number(status),
          isDeleted: false
        }
      })
      const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)
      if (!page || page < 1) page = 1
      if (page > totalPages) page = totalPages
      let next = (page - 1) * pageSize
      let contributions = await this.prismaService.contribution.findMany({
        skip: next,
        take: pageSize,
        where: {
          // type, status: Number(status),
          isDeleted: false
        }, include: {
          User: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      //contributions.forEach((contribution) => contribution.content = JSON.parse(contribution.content as string))
      return new ResponseData<any>({ data: contributions, totalPages, total: totalCount }, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      console.log(error)
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllByUser(option: { type: string, page: number }, userId: number) {
    let pageSize = PAGE_SIZE.PAGE_CONTRIBUTION

    try {
      let { page, type } = option
      const totalCount = await this.prismaService.contribution.count({
        where: { userId, isDeleted: false }
      })
      const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)
      if (!page || page < 1) page = 1
      if (page > totalPages) page = totalPages
      let next = (page - 1) * pageSize

      let contributions = await this.prismaService.contribution.findMany({
        skip: next,
        take: pageSize, where: { userId, isDeleted: false },
        include: {
          User: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      // contributions.forEach((contribution) => contribution.content = JSON.parse(String(contribution.content)))
      return new ResponseData<any>({ data: contributions, totalPages, total: totalCount }, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) throw new HttpException('Đóng góp không tồn tại', HttpStatus.NOT_FOUND)
      return new ResponseData<Contribution>(contribution, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyWordContribution(id: number, body: { status: number, feedback: string }) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) {
        throw new HttpException('Đóng góp không tồn tại', HttpStatus.NOT_FOUND)
      }
      if (contribution.status !== CONTRIBUTION.PENDING) {
        throw new HttpException("Đóng góp đã được duyệt", HttpStatus.CONFLICT)
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: contribution.userId }, select: {
          fcmToken: true,
          name: true
        }
      })

      if (body.status === CONTRIBUTION.APPROVED) {
        const { topicId = [], levelId, specializationId, content, meanings = [], note, phonetic, examples = [], synonyms = [], antonyms = [], pictures = [] } = JSON.parse(JSON.stringify(contribution.content))
        const { userId } = contribution

        const result = await this.wordService.create({ topicId: topicId.map(id => Number(id)), levelId, specializationId, content, meanings, note, phonetic, synonyms, antonyms, userId, examples, pictures }, null)


        if (result.statusCode === HttpStatus.CREATED) {
          const updatedCon = await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: null } })

          this.sendNotification(`Hey ${user.name}`, `Đóng góp #${content} của bạn đã được duyệt!`, {
            type: 'contribution',
            data: { reason: body.feedback ?? "" }
          }, userId, user.fcmToken)

          return new ResponseData<Contribution>(updatedCon, HttpStatus.OK, 'Duyệt thành công')
        }
      } else if (body.status === CONTRIBUTION.REFUSED) {
        const updatedCon = await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: body.feedback } })

        this.sendNotification(`Hey ${user.name}`, `Chúng tôi rất tiết. Đóng góp #${JSON.parse(JSON.stringify(contribution.content)).content} của bạn đã bị từ chối!`, {
          type: 'contribution',
          data: { reason: body.feedback ?? "" }
        }, contribution.userId, user.fcmToken)

        return new ResponseData<Contribution>(updatedCon, HttpStatus.OK, 'Từ chối thành công')
      }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendNotification(title: string, body: string, data: any, userId: number, fcmToken: string) {
    const createNotificationDto: CreateNotificationDto = {
      title,
      body,
      data,
      userId
    }

    this.notificationService.sendNotification(fcmToken, createNotificationDto)
  }


  async verifySenContribution(id: number, body: { status: number, feedback: string }) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) {
        throw new HttpException('Đóng góp không tồn tại', HttpStatus.NOT_FOUND)
      }
      if (contribution.status !== CONTRIBUTION.PENDING) {
        throw new HttpException("Đóng góp đã được duyệt", HttpStatus.CONFLICT)
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: contribution.userId }, select: {
          fcmToken: true,
          name: true
        }
      })

      if (body.status === CONTRIBUTION.APPROVED) {
        const { topicId = [], content, meaning, note, typeId } = JSON.parse(JSON.stringify(contribution.content))
        const { userId } = contribution

        const result = await this.sentenceService.create({ topicId: topicId.map(id => Number(id)), content, meaning, note, userId, typeId })
        if (result.statusCode === HttpStatus.CREATED) {
          const updatedCon = await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: body.feedback } })

          this.sendNotification(`Hey ${user.name}`, `Đóng góp #${content} của bạn đã được duyệt!`, {
            type: 'contribution',
            data: { reason: body.feedback ?? "" }
          }, userId, user.fcmToken)

          return new ResponseData<Contribution>(updatedCon, HttpStatus.OK, 'Duyệt thành công')
        }
      } else if (body.status === CONTRIBUTION.REFUSED) {
        const updatedCon = await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: body.feedback } })

        this.sendNotification(`Hey ${user.name}`, `Chúng tôi rất tiết. Đóng góp #${JSON.parse(JSON.stringify(contribution.content)).content} của bạn đã bị từ chối!`, {
          type: 'contribution',
          data: { reason: body.feedback ?? "" }
        }, contribution.userId, user.fcmToken)

        return new ResponseData<Contribution>(updatedCon, HttpStatus.OK, 'Từ chối thành công')
      }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number, account: Account) {
    try {
      const contribution = await this.findById(id)
      if (!contribution) throw new HttpException('Đóng góp không tồn tại', HttpStatus.NOT_FOUND)
      // if (account.accountType === 'user') {
      //   if (contribution.userId !== account.userId) return new ResponseData<Contribution>(null, 400, 'Không có quyền hạn để xóa')
      // }
      return new ResponseData<Contribution>(await this.prismaService.contribution.delete({ where: { id } }), HttpStatus.OK, 'Xóa thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: number) {
    const contribution = await this.prismaService.contribution.findUnique({ where: { id: id, isDeleted: false } })
    if (!contribution) return null
    //contribution.content = JSON.parse(contribution.content as string)
    return contribution
  }


}
