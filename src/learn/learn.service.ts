import { Injectable } from '@nestjs/common';
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

      return new ResponseData<any>({ count: res.length, data: groupedWords }, 200, 'Lấy thống kê thành công')
    } catch (error) {
      console.log(error);
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
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

      return new ResponseData<any>(res, 200, 'Tạo nhắc nhở thành công')
    } catch (error) {
      console.log(error);
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  async updateReminder(id: number, updateLearnDto: UpdateReviewReminderDto, userId: number) {
    try {
      const res = await this.prismaService.reviewReminder.update({
        where: { id, userId },
        data: updateLearnDto
      })
      return new ResponseData<any>(res, 200, 'Cập nhật nhắc nhở thành công')
    } catch (error) {
      console.log(error);
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
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

      return new ResponseData<ReviewReminder | null>(res[0] ?? null, 200, 'Lấy nhắc nhở thành công')
    } catch (error) {
      console.log(error);
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
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
              every: {
                id: {
                  in: [...wordIds]
                }
              }
            }
          }
        }
      }
      )

      if (isNotExistWord.length === 0) {
        return new ResponseData<any>(null, 400, 'Không tồn tại từ này trong bộ')
        // throw new Error('Không tồn tại từ này trong bộ')
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
      return new ResponseData<any>(transactionResult, 200, 'Lưu kết quả thành công')
    } catch (error) {
      console.log(error);
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
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
      return new ResponseData<UserLearnedWord>(res, 200, 'Tìm thành công')
    } catch (error) {
      console.log(error);
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
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
