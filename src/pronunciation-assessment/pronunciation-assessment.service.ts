import { Injectable } from '@nestjs/common';
import { CreatePronunciationAssessmentDto } from './dto/create-pronunciation-assessment.dto';
import { UpdatePronunciationAssessmentDto } from './dto/update-pronunciation-assessment.dto';
import { PRO_ASSESSMENT, ResponseData } from 'src/global';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PronunciationAssessmentService {

  constructor(private readonly prismaService: PrismaService) { }
  async create(createPronunciationAssessmentDto: CreatePronunciationAssessmentDto, userId: number) {
    try {

      const { label, score, phones } = createPronunciationAssessmentDto
      const res = await this.prismaService.pronunciationAssessment.create({
        data: {
          userId,
          label,
          score, phonemeAssessments: { create: [...phones] }
        }
      })
      return new ResponseData<any>(res, 200, 'Lưu thành công')

    } catch (error) {
      console.log(error);
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  findAll() {
    return `This action returns all pronunciationAssessment`;
  }

  async findAllByUser(userId: number) {
    try {
      const res = await this.prismaService.pronunciationAssessment.findMany({
        where: { userId }
      })
      return new ResponseData<any>(res, 200, 'Tìm thành công')

    } catch (error) {
      console.log(error);
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} pronunciationAssessment`;
  }

  update(id: number, updatePronunciationAssessmentDto: UpdatePronunciationAssessmentDto) {
    return `This action updates a #${id} pronunciationAssessment`;
  }

  remove(id: number) {
    return `This action removes a #${id} pronunciationAssessment`;
  }

  async getUserProStatistics(userId: number) {
    try {
      const resAvg = await this.prismaService.pronunciationAssessment.aggregate({

        _avg: {
          score: true,

        },
        where: {
          userId: userId,
        },

      })

      const resDetail = await this.prismaService.phonemeAssessment.groupBy({
        by: 'label',
        _avg: {
          score: true
        },
        where: {
          PronunciationAssessment: {
            userId
          }
        },

      })

      const avgScore = resAvg._avg?.score || 0;

      const detail = resDetail.map((item) => ({
        label: item.label,
        avg: item._avg?.score || 0,
      }));

      const lablesNeedToBeImprove: any[] = []
      const lablesDoWell: any[] = []

      detail.map(item => {
        if (item.avg < PRO_ASSESSMENT.NEED_TO_IMPROVE_THRESHOLD) {
          lablesNeedToBeImprove.push(item)
        } else {
          lablesDoWell.push(item)
        }
      })

      const suggestWordsToImprove = await this.prismaService.word.findMany({
        where: {
          OR: lablesNeedToBeImprove.map(item => ({
            phonetic: {
              contains: item.label
            }
          }))
        },
        take: PRO_ASSESSMENT.NUM_OF_SUGGESTS,
      });

      const result = {
        Avg: avgScore,
        detail: detail,
        lablesNeedToBeImprove, lablesDoWell,
        suggestWordsToImprove
      };


      return new ResponseData<any>(result, 200, 'Kết quả thống kê phát âm của người dùng')

    } catch (error) {
      console.log(error);
      return new ResponseData<string>(null, 500, 'Lỗi dịch vụ, thử lại sau')
    }
  }
}
