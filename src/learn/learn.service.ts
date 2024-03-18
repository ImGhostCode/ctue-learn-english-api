import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLearnDto } from './dto/create-learn.dto';
import { UpdateLearnDto } from './dto/update-learn.dto';
import { CreateReviewReminderDto } from './dto/createReviewReminder.dto';
import { PrismaService } from 'nestjs-prisma';
import { SaveTheLearnedResultDto } from './dto/saveTheLearnedResult.dto';
import { ResponseData } from 'src/global';
import { ReviewReminder, UserLearnedWord } from '@prisma/client';
import { UpdateReviewReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class LearnService {
  constructor(private readonly prismaService: PrismaService) { }

  async getStatistics(userId: number, setId: number) {
    try {
      const whereCondition: any = {
        userId
      }
      if (setId) whereCondition.vocabularySetId = setId

      const res = await this.prismaService.userLearnedWord.findMany({
        where: whereCondition,

        include: {
          Word: true
        }
      })

      const groupedWords = {}

      res.forEach(item => {
        if (!groupedWords[`level_${item.memoryLevel}`]) {
          groupedWords[`level_${item.memoryLevel}`] = []
        }
        groupedWords[`level_${item.memoryLevel}`].push(item)

      })

      return new ResponseData<any>({ count: res.length, detail: groupedWords }, HttpStatus.OK, 'Lấy thống kê thành công')
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }



  async createReivewReminder(createReviewReminderDto: CreateReviewReminderDto, userId: number) {
    try {
      const { vocabularySetId, data } = createReviewReminderDto
      const groupedReminders = {}

      data.forEach(item => {
        const time = item.reviewAt.toISOString()

        if (!groupedReminders[time]) {
          groupedReminders[time] = {
            userId,
            vocabularySetId,
            isDone: false,
            reviewAt: item.reviewAt,
            words: {
              connect: [{ id: item.wordId }],
            },
          };
        } else {
          groupedReminders[time].words.connect.push({ id: item.wordId });
        }
      })

      const reminderData: any[] = Object.values(groupedReminders)

      const res = await this.prismaService.$transaction([
        ...reminderData.map(data =>
          this.prismaService.reviewReminder.create({
            data: {
              userId,
              vocabularySetId,
              isDone: false,
              reviewAt: data.reviewAt,
              words: data.words
            },
            // include: {
            //   words: true
            // }
          }))
      ])

      return new ResponseData<any>(res, HttpStatus.CREATED, 'Tạo nhắc nhở thành công')
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  async updateReminder(id: number, updateLearnDto: UpdateReviewReminderDto, userId: number) {
    try {
      const res = await this.prismaService.reviewReminder.update({
        where: { id, userId },
        data: updateLearnDto
      })
      return new ResponseData<any>(res, HttpStatus.OK, 'Cập nhật nhắc nhở thành công')
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  async getReminderComing(userId: number) {
    try {
      const res = await this.prismaService.reviewReminder.findMany({
        where: {
          userId,
          isDone: false
        },
        orderBy: {
          reviewAt: 'asc'
        }
      })

      return new ResponseData<ReviewReminder | null>(res[0] ?? null, HttpStatus.OK, 'Lấy nhắc nhở thành công')
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  async saveTheLearnedResult(saveTheLearnedResultDto: SaveTheLearnedResultDto, userId: number) {
    try {
      const { wordIds, vocabularySetId, memoryLevels } = saveTheLearnedResultDto

      const isNotExistWord = await this.prismaService.userVocabularySet.findMany({
        where: {
          userId,
          vocabularySetId,
          VocabularySet: {
            words: {
              some: {
                id: {
                  in: wordIds
                }
              }
            }
          }
        }
      }
      )

      if (isNotExistWord.length === 0) {
        throw new HttpException('Không tồn tại từ này trong bộ', HttpStatus.NOT_FOUND)
      }

      const saveData = wordIds.map((id, index) => ({
        wordId: id,
        vocabularySetId,
        userId,
        memoryLevel: memoryLevels[index]
      }));

      const transactionResult = await this.prismaService.$transaction([
        ...saveData.map(data =>
          this.prismaService.userLearnedWord.upsert({
            where: {
              userId_wordId_vocabularySetId: {
                userId: data.userId,
                wordId: data.wordId,
                vocabularySetId: data.vocabularySetId
              }
            },
            update: data,
            create: data
          })
        ),
      ]);
      return new ResponseData<any>(transactionResult, HttpStatus.CREATED, 'Lưu kết quả thành công')
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  async getUserLearnedWords(setId: number | undefined = undefined, userId: number) {
    try {
      const whereCondition: any = {}
      whereCondition.userId = userId
      if (setId) whereCondition.vocabularySetId = setId

      const res = await this.prismaService.userLearnedWord.findMany({
        where: whereCondition,
        include: {
          Word: true
        }
      })
      return new ResponseData<UserLearnedWord>(res, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  create(createLearnDto: CreateLearnDto) {
    return 'This action adds a new learn';
  }

  findAll() {
    return `This action returns all learn`;
  }

  findOne(id: number) {
    return `This action returns a #${id} learn`;
  }

  update(id: number, updateLearnDto: UpdateLearnDto) {
    return `This action updates a #${id} learn`;
  }

  remove(id: number) {
    return `This action removes a #${id} learn`;
  }
}
