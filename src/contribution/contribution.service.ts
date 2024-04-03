import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSenContributionDto, CreateWordContributionDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { CONSTANTS_MAX, CONTRIBUTION, PAGE_SIZE, ResponseData } from '../global';
import { Account, Contribution, Sentence, Word } from '@prisma/client';
import { WordService } from '../word/word.service';
import { SentenceService } from '../sentence/sentence.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { getMessaging, getToken, onMessage, Messaging } from "@firebase/messaging";
import { messaging } from 'firebase-admin';

@Injectable()
export class ContributionService {

  constructor(private prismaService: PrismaService, private wordService: WordService, private sentenceService: SentenceService, private cloudinaryService: CloudinaryService) { }

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
      if (body.status === CONTRIBUTION.APPROVED) {
        const { topicId = [], levelId, specializationId, content, meanings = [], note, phonetic, examples = [], synonyms = [], antonyms = [], pictures = [] } = JSON.parse(JSON.stringify(contribution.content))
        const { userId } = contribution

        const result = await this.wordService.create({ topicId: topicId.map(id => Number(id)), levelId, specializationId, content, meanings, note, phonetic, synonyms, antonyms, userId, examples, pictures }, null)

        if (result.statusCode === HttpStatus.CREATED) {
          await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: '' } })
          return new ResponseData<Word>(result.data, HttpStatus.OK, 'Duyệt thành công')
        }
      } else if (body.status === CONTRIBUTION.REFUSED) {
        await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: body.feedback } })
        return new ResponseData<string>(null, HttpStatus.OK, 'Từ chối thành công')
      }
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
      if (body.status === CONTRIBUTION.APPROVED) {
        const { topicId = [], content, meaning: mean, note, typeId } = JSON.parse(JSON.stringify(contribution.content))
        const { userId } = contribution

        const result = await this.sentenceService.create({ topicId: topicId.map(id => Number(id)), content, mean, note, userId, typeId })

        if (result.statusCode === HttpStatus.CREATED) {
          await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: '' } })
          return new ResponseData<Sentence>(result.data, HttpStatus.OK, 'Duyệt thành công')
        }
      } else if (body.status === CONTRIBUTION.REFUSED) {
        await this.prismaService.contribution.update({ where: { id }, data: { status: Number(body.status), feedback: body.feedback } })
        return new ResponseData<string>(null, HttpStatus.OK, 'Từ chối thành công')
      }
    } catch (error) {
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

  async sendNotification(registrationToken: string, account: Account) {
    // This registration token comes from the client FCM SDKs.
    // const registrationToken = 'YOUR_REGISTRATION_TOKEN';

    const message = {
      data: {
        score: '850',
        time: '2:45'
      },
      notification: { title: "testtt", body: "Duyet dong gop thanh cong" },
      token: registrationToken
    };

    console.log(registrationToken);

    // Send a message to the device corresponding to the provided
    // registration token.
    messaging()
      .send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  }
}
