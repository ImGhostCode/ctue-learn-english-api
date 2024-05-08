import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CONTRIBUTION, ResponseData } from 'src/global';
import { PrismaService } from 'src/prisma/prisma.service'; // Nhớ import PrismaService

@Injectable()
export class StatisticsService {
    constructor(private prisma: PrismaService) { }

    async getUserStatistics(
        startDate: string,
        endDate: string,
    ): Promise<any> {
        try {
            const selectedTime: any = {}
            if (startDate) selectedTime.gte = new Date(startDate)
            if (endDate) selectedTime.lte = new Date(endDate)

            const totalUsers = await this.prisma.account.count({
                where: {
                    createdAt: selectedTime,
                }
            });
            const activeUsers = await this.prisma.account.count({ where: { isDeleted: false, createdAt: selectedTime } });
            const bannedUsers = await this.prisma.account.count({ where: { isBanned: true, createdAt: selectedTime } });
            const deletedUsers = await this.prisma.account.count({ where: { isDeleted: true, createdAt: selectedTime } });


            return new ResponseData<any>({
                total: totalUsers,
                active: activeUsers,
                banned: bannedUsers,
                deleted: deletedUsers,
            }, HttpStatus.OK, 'Thống kê thành công');
        } catch (error) {
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // Hàm thống kê đóng góp theo nhóm (tương tự)
    async getContributionStatistics(startDate: string, endDate: string) {
        try {
            const selectedTime: any = {};
            if (startDate) selectedTime.gte = new Date(startDate);
            if (endDate) selectedTime.lte = new Date(endDate);

            const contributionStats = await this.prisma.contribution.groupBy({
                by: ['status'],
                where: {
                    isDeleted: false,
                    createdAt: selectedTime,
                },
                _count: {
                    _all: true,
                },
            });

            // Xử lý dữ liệu trả về để có format phù hợp
            const result = {
                total: 0,
                pending: 0,
                refused: 0,
                approved: 0,
            };

            contributionStats.forEach((item) => {
                switch (item.status) {
                    case CONTRIBUTION.PENDING: // Assuming CONTRIBUTION is an enum
                        result.pending = item._count._all;
                        break;
                    case CONTRIBUTION.REFUSED:
                        result.refused = item._count._all;
                        break;
                    case CONTRIBUTION.APPROVED:
                        result.approved = item._count._all;
                        break;
                }
                result.total += item._count._all;
            });

            return new ResponseData<any>(result, HttpStatus.OK, 'Thống kê thành công');
        } catch (error) {
            throw new HttpException(
                error.response || 'Lỗi dịch vụ, thử lại sau',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getWordStatistics(startDate: string, endDate: string) {
        try {
            const selectedTime: any = {};
            if (startDate) selectedTime.gte = new Date(startDate);
            if (endDate) selectedTime.lte = new Date(endDate);

            const [totalCount, wordStatsBySpecialization, wordStatsByLevel, wordStatsByTopic] = await Promise.all([
                this.prisma.word.count({
                    where: {
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                }),
                this.prisma.word.groupBy({
                    by: ['specializationId'],
                    where: {
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                    _count: {
                        _all: true,
                    },
                }),
                this.prisma.word.groupBy({
                    by: ['levelId'],
                    where: {
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                    _count: {
                        _all: true,
                    },
                }),
                this.prisma.$queryRaw`
     SELECT t.name as topicName, CAST(COUNT(w.id) AS VARCHAR) as count 
    FROM words w
    JOIN "_TopicToWord" wt ON w.id = wt."B"
    JOIN topics t ON wt."A" = t.id
    WHERE w."isDeleted" = false AND w."createdAt" >= ${selectedTime.gte} AND w."createdAt" <= ${selectedTime.lte}
    GROUP BY t.id
  `
            ]);


            const specializations = await this.prisma.specialization.findMany();
            const levels = await this.prisma.level.findMany();


            // Xử lý data để có format phù hợp với yêu cầu
            const formattedStats = {
                total: totalCount,
                bySpecialization: wordStatsBySpecialization
                    .map(item => ({
                        specializationName: specializations.find(s => s.id === item.specializationId)?.name,
                        count: item._count._all,
                    })),
                byLevel: wordStatsByLevel
                    .map(item => ({
                        levelName: levels.find(l => l.id === item.levelId)?.name,
                        count: item._count._all,
                    })),
                byTopic: (wordStatsByTopic as WordStatsByTopicResult[]).map(item => ({
                    topicName: item.topicname,
                    count: Number(item.count),
                })),
            };

            return new ResponseData<any>(formattedStats, HttpStatus.OK, 'Thống kê thành công');
        } catch (error) {
            console.log(error);

            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // Hàm thống kê từ
    async getSentenceStatistics(startDate: string, endDate: string) {
        try {
            const selectedTime: any = {};
            if (startDate) selectedTime.gte = new Date(startDate);
            if (endDate) selectedTime.lte = new Date(endDate);

            const [totalCount, sentencetatsByType, sentencetatsByTopic] = await Promise.all([
                this.prisma.sentence.count({
                    where: {
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                }),
                this.prisma.sentence.groupBy({
                    by: ['typeId'],
                    where: {
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                    _count: {
                        _all: true,
                    },
                }),
                this.prisma.$queryRaw`
     SELECT t.name as topicName, CAST(COUNT(s.id) AS VARCHAR) as count 
    FROM sentences s
    JOIN "_SentenceToTopic" st ON s.id = st."A"
    JOIN topics t ON st."B" = t.id
    WHERE s."isDeleted" = false AND s."createdAt" >= ${selectedTime.gte} AND s."createdAt" <= ${selectedTime.lte}
    GROUP BY t.id` ]);

            const types = await this.prisma.type.findMany();

            // Xử lý data để có format phù hợp với yêu cầu
            const formattedStats = {
                total: totalCount,
                byType: sentencetatsByType
                    .map(item => ({
                        typeName: types.find(s => s.id === item.typeId)?.name,
                        count: item._count._all,
                    })),
                byTopic: (sentencetatsByTopic as SentenceStatsByTopicResult[]).map(item => ({
                    topicName: item.topicname,
                    count: Number(item.count),
                })),
            };

            return new ResponseData<any>(formattedStats, HttpStatus.OK, 'Thống kê thành công');
        } catch (error) {
            console.log(error);

            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Hàm thống kê từ
    async getIrregularVerbStatistics(startDate: string, endDate: string) {
        try {
            const selectedTime: any = {};
            if (startDate) selectedTime.gte = new Date(startDate);
            if (endDate) selectedTime.lte = new Date(endDate);

            const totalIrrVerbs = await this.prisma.irregularVerb.count({
                where: {
                    createdAt: selectedTime,
                }
            });
            const deletedIrrVerbs = await this.prisma.irregularVerb.count({ where: { isDeleted: true, createdAt: selectedTime } });

            return new ResponseData<any>({ total: totalIrrVerbs, deleted: deletedIrrVerbs }, HttpStatus.OK, 'Thống kê thành công');
        } catch (error) {
            throw new HttpException(
                error.response || 'Lỗi dịch vụ, thử lại sau',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Hàm thống kê từ, câu, bộ từ
    async getVocabPackStatistics(startDate: string, endDate: string) {
        try {
            const selectedTime: any = {};
            if (startDate) selectedTime.gte = new Date(startDate);
            if (endDate) selectedTime.lte = new Date(endDate);

            const [totalCount, totalPublic, totalPrivate, vocabularyPackstatsBySpec, vocabularyPackstatsByTopic] = await Promise.all([
                this.prisma.vocabularyPack.count({
                    where: {
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                }),
                this.prisma.vocabularyPack.count({
                    where: {
                        isPublic: true,
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                }),
                this.prisma.vocabularyPack.count({
                    where: {
                        isPublic: false,
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                }),
                this.prisma.vocabularyPack.groupBy({
                    by: ['specId'],
                    where: {
                        specId: {
                            not: null,
                        },
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                    _count: {
                        _all: true,
                    },
                }),
                this.prisma.vocabularyPack.groupBy({
                    by: ['topicId'],
                    where: {
                        topicId: {
                            not: null,
                        },
                        isDeleted: false,
                        createdAt: selectedTime,
                    },
                    _count: {
                        _all: true,
                    },
                }),
            ]);

            const specializations = await this.prisma.specialization.findMany();
            const topics = await this.prisma.topic.findMany();

            // Xử lý data để có format phù hợp với yêu cầu
            const formattedStats = {
                total: totalCount,
                totalPublic: totalPublic,
                totalPrivate: totalPrivate,
                bySpecialization: vocabularyPackstatsBySpec
                    .map(item => ({
                        specializationName: specializations.find(s => s.id === item.specId)?.name ?? 'Chưa xác định',
                        count: item._count._all,
                    })),
                byTopic: vocabularyPackstatsByTopic.map(item => ({
                    topicName: topics.find(s => s.id === item.topicId)?.name ?? 'Chưa xác định',
                    count: item._count._all,
                })),
            };

            return new ResponseData<any>(formattedStats, HttpStatus.OK, 'Thống kê thành công');
        } catch (error) {
            console.log(error);
            throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


interface WordStatsByTopicResult {
    topicname: string;
    count: number;
}
interface SentenceStatsByTopicResult {
    topicname: string;
    count: number;
}

