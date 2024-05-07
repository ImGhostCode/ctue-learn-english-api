import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLearnDto } from './dto/create-learn.dto';
import { UpdateLearnDto } from './dto/update-learn.dto';
import { CreateReviewReminderDto } from './dto/createReviewReminder.dto';
import { PrismaService } from 'nestjs-prisma';
import { SaveTheLearnedResultDto } from './dto/saveTheLearnedResult.dto';
import { PAGE_SIZE, ResponseData } from 'src/global';
import { UserLearnedWord } from '@prisma/client';
import { UpdateReviewReminderDto } from './dto/update-reminder.dto';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LearnService {

  constructor(private readonly prismaService: PrismaService, private readonly notificationService: NotificationService,) { }

  async getLeaningHistory(option: { level?: number | undefined; page: number, sort?: string | undefined }, userId?: number | undefined) {
    let pageSize = PAGE_SIZE.PAGE_LEARN_HISTORY
    try {
      let { page,
        level = 1,
        sort = 'desc'
      } = option
      const whereCondition: any = {
        memoryLevel: Number(level),
        isDeleted: false

      }
      if (userId) whereCondition.userId = userId
      const totalCount = await this.prismaService.userLearnedWord.count({
        where: whereCondition
      })
      const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / pageSize)
      if (!page || page < 1) page = 1
      if (page > totalPages) page = totalPages
      let next = (page - 1) * pageSize
      let words = await this.prismaService.userLearnedWord.findMany({
        skip: next,
        take: pageSize,
        where: whereCondition, include: {
          User: true,
          Word: true
        },
        orderBy: {
          updatedAt: sort === 'asc' ? 'asc' : 'desc'
        }
      })
      return new ResponseData<any>({ data: words, totalPages, total: totalCount }, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      console.log(error)
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getStatistics(userId: number, packId?: number | undefined) {
    try {
      const whereCondition: any = {
        userId,
        isDeleted: false
      }

      if (packId) whereCondition.vocabularyPackId = packId

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
      const { vocabularyPackId, data } = createReviewReminderDto
      const groupedReminders = {}

      data.forEach(item => {
        // console.log(item.reviewAt);

        const time = item.reviewAt.toISOString()

        if (!groupedReminders[time]) {
          groupedReminders[time] = {
            userId,
            vocabularyPackId,
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
              vocabularyPackId,
              isDone: false,
              reviewAt: data.reviewAt,
              words: data.words
            },
            include: {
              words: true
            }
          }))
      ])


      // handle schedule send notification when review
      // res.forEach(async reminder => {
      //   this.notificationService.scheduleRemindNotification(userId, reminder.words.length, reminder.reviewAt)
      // })

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

  async getUpcomingReminder(userId: number, packId?: number | undefined) {
    try {
      const whereCondition: any = {
        isDeleted: false
      }
      whereCondition.userId = userId
      whereCondition.isDone = false
      if (packId) whereCondition.vocabularyPackId = packId

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
        const results = await this.getUserLearnedWords(res[0].vocabularyPackId, userId)
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
      const { wordIds, vocabularyPackId, memoryLevels, reviewReminderId } = saveTheLearnedResultDto

      memoryLevels.forEach(level => {
        if (level < 1 || level > 6) {
          throw new HttpException('Cấp độ nhớ phải nằm trong khoảng từ 1 đến 6', HttpStatus.BAD_REQUEST)
        }
      })

      const isNotExistWord = await this.prismaService.userVocabularyPack.findMany({
        where: {
          userId,
          isDeleted: false,
          vocabularyPackId,
          VocabularyPack: {
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
        vocabularyPackId,
        userId,
        memoryLevel: memoryLevels[index],
        isDeleted: false
      }));


      const transactionResult = await this.prismaService.$transaction([
        ...saveData.map(data =>
          this.prismaService.userLearnedWord.upsert({

            create: data,
            update: data,
            where: {
              userId_wordId_vocabularyPackId: {
                userId: data.userId,
                wordId: data.wordId,
                vocabularyPackId: data.vocabularyPackId
              }
            },
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

  async getUserLearnedWords(packId: number | undefined = undefined, userId: number) {
    try {
      const whereCondition: any = {
        isDeleted: false
      }
      whereCondition.userId = userId
      if (packId) whereCondition.vocabularyPackId = packId

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

  // Auto send notification to remind user to review at 7:00 AM everyday
  @Cron('0 7 * * *')
  async sendNotiRemindToReview() {
    const now = new Date()
    const reminders = await this.prismaService.reviewReminder.findMany({
      where: {
        reviewAt: {
          lte: now
        },
        isDeleted: false
        , isDone: false,
      },
      include: {
        User: {
          select: {
            fcmToken: true,
            name: true,
            id: true,
          },
        },
        words: true
      }
    })

    class RemindData {
      id: number
      name: string
      fcmToken: string
      numOfWord: number
      constructor(fcmToken: string, numOfWord: number, name: string, id: number) {
        this.fcmToken = fcmToken
        this.numOfWord = numOfWord
        this.name = name
        this.id = id
      }
    }

    const notificationData: any = {}
    reminders.forEach(async reminder => {
      if (!notificationData[reminder.User.id]) {
        notificationData[reminder.User.id] = new RemindData(reminder.User.fcmToken, reminder.words.length, reminder.User.name, reminder.User.id)
      } else {
        notificationData[reminder.User.id].numOfWord += reminder.words.length
      }
    })

    Object.values(notificationData).forEach(async (reminder: RemindData) => {
      this.notificationService.sendNotification(reminder.fcmToken, { userId: reminder.id, title: `Hey ${reminder.name}`, body: `Bạn có ${reminder.numOfWord} cần ôn tập!` } as CreateNotificationDto)
    })
  }

  // Auto analize learned words and update user's top 3 topics at weedly
  @Cron('0 0 * * 0')
  async analizeLearnedWords() {
    // Fetch all learned words for all users
    const learnedWords = await this.prismaService.userLearnedWord.findMany({
      where: {
        isDeleted: false,

        // Get all words that have been updated in the last 7 days
        updatedAt: {
          gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        Word: {
          select: {
            Topic: true
          }
        }
      }
    });

    // Group learned words by userId and count the occurrence of each topic
    const userTopicCounts = learnedWords.reduce((counts, learnedWord) => {
      const userId = learnedWord.userId;
      if (!counts[userId]) {
        counts[userId] = {};
      }

      learnedWord.Word.Topic.forEach(topic => {
        const topicId = topic.id;
        if (!counts[userId][topicId]) {
          counts[userId][topicId] = 0;
        }
        counts[userId][topicId]++;
      });

      return counts;
    }, {});

    // Sort topics by occurrence for each user
    const userSortedTopics = Object.entries(userTopicCounts).map(([userId, topicCounts]) => {
      const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
      return {
        userId: userId,
        topics: sortedTopics
      };
    });

    this.updateUserTopics(userSortedTopics);
  }

  async updateUserTopics(userSortedTopics) {
    // Get the top 3 topics for each user
    userSortedTopics.forEach(user => {
      user.topics = user.topics.slice(0, 3);
    });

    // update the user's top 3 topics in the database
    userSortedTopics.forEach(async (user) => {
      const userId = parseInt(user.userId);
      const topics = user.topics.map(topic => parseInt(topic[0]));
      await this.prismaService.user.update({
        where: {
          id: userId
        },
        data: {
          interestTopics: {
            connect: topics.map(topicId => ({ id: topicId }))
          }
        }
      });
    });
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
