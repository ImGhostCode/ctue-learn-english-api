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

  async getStatistics(userId: number, setId?: number | undefined) {
    try {
      const whereCondition: any = {
        userId
      }

      if (setId) whereCondition.vocabularySetId = setId

      const res = await this.prismaService.userLearnedWord.findMany({
        where: whereCondition,
        include: {
          Word: {
            include: {
              Level: {
                select: {
                  name: true
                }
              },
              Specialization: {
                select: {
                  name: true
                }
              }
            }
          }
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
        // console.log(item.reviewAt);

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
      //console.log(JSON.stringify(reminderData));


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
            include: {
              words: true
            }
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

  async getUpcomingReminder(userId: number, setId?: number | undefined) {
    try {
      const whereCondition: any = {}
      whereCondition.userId = userId
      whereCondition.isDone = false
      if (setId) whereCondition.vocabularySetId = setId

      const res = await this.prismaService.reviewReminder.findMany({
        where: whereCondition,
        include: {
          words: {
            select: {
              id: true,
            }
          }
        },
        orderBy: {
          reviewAt: 'asc'
        }
      })
      const learnedWords = [];
      if (res[0]) {
        const results = await this.getUserLearnedWords(res[0].vocabularySetId, userId)
        results.data.forEach(item => {
          if (res[0].words.find(word => word.id === item.wordId)) {
            learnedWords.push(item)
          }
        })
      }

      return new ResponseData<any | null>(res[0] ? { ...res[0], learnedWords } : null, HttpStatus.OK, 'Lấy nhắc nhở thành công')
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  async saveTheLearnedResult(saveTheLearnedResultDto: SaveTheLearnedResultDto, userId: number) {
    try {
      const { wordIds, vocabularySetId, memoryLevels, reviewReminderId } = saveTheLearnedResultDto

      memoryLevels.forEach(level => {
        if (level < 1 || level > 6) {
          throw new HttpException('Cấp độ nhớ phải nằm trong khoảng từ 1 đến 6', HttpStatus.BAD_REQUEST)
        }
      })

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

      if (reviewReminderId) {
        await this.updateReminder(reviewReminderId, { isDone: true }, userId)
      }

      return new ResponseData<any>({ results: transactionResult }, HttpStatus.CREATED, 'Lưu kết quả thành công')
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
          Word: {
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
          },
        }
      })
      return new ResponseData<UserLearnedWord[]>(res, HttpStatus.OK, 'Tìm thành công')
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
