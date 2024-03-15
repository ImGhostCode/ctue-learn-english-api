import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePronunciationAssessmentDto } from './dto/create-pronunciation-assessment.dto';
import { UpdatePronunciationAssessmentDto } from './dto/update-pronunciation-assessment.dto';
import { PRO_ASSESSMENT, ResponseData } from 'src/global';
import { PrismaService } from 'nestjs-prisma';
import { AssessPronunciationDto } from './dto/assess-pronunciation.dto';
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

@Injectable()
export class PronunciationAssessmentService {


  constructor(private readonly prismaService: PrismaService) { }

  async assess(assessPronunciationDto: AssessPronunciationDto, userId: number, audio: Express.Multer.File) {
    try {
      var audioConfig = sdk.AudioConfig.fromWavFileInput(audio.buffer);
      var speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SUBSCRIPTION_KEY, process.env.SERVICE_REGION_KEY);
      var reference_text = assessPronunciationDto.text;
      var pronunciationAssessmentConfig = sdk.PronunciationAssessmentConfig.fromJSON(
        `{\"referenceText\":\"${reference_text}\",\"gradingSystem\":\"HundredMark\",\"granularity\":\"Phoneme\",\"phonemeAlphabet\":\"IPA\"}`
      );
      pronunciationAssessmentConfig.enableProsodyAssessment = true;


      var language = "en-US"
      speechConfig.speechRecognitionLanguage = language;

      var reco = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationAssessmentConfig.applyTo(reco);

      const recognitionPromise = new Promise((resolve, reject) => {
        reco.recognized = async (s, e) => {
          let result = null;
          var pronunciation_result = sdk.PronunciationAssessmentResult.fromResult(e.result);
          let isIncluded: boolean = false;
          pronunciation_result.detailResult.Words.forEach(word => {
            if (assessPronunciationDto.text.includes(word.Word) && word.PronunciationAssessment.ErrorType !== 'Mispronunciation') {
              isIncluded = true
            }
          })

          if (isIncluded) {
            const data: any = {
              userId,
              label: assessPronunciationDto.text,
              score: pronunciation_result.completenessScore,
              phonemeAssessments: pronunciation_result.detailResult.Words[0].Phonemes.map(phonem => ({
                label: phonem.Phoneme,
                score: phonem.PronunciationAssessment['AccuracyScore']
              }))
            }
            result = await this.prismaService.pronunciationAssessment.create({
              data: {
                userId: data.userId,
                label: data.label,
                score: data.score,
                phonemeAssessments: {
                  create: data.phonemeAssessments
                }
              },
              include: {
                phonemeAssessments: true
              }
            })
          };
          resolve(result); // Resolve with the result
        };

        reco.canceled = (s, e) => {
          if (e.reason === sdk.CancellationReason.Error) {
            var str = "(cancel) Reason: " + sdk.CancellationReason[e.reason] + ": " + e.errorDetails;
            // console.log(str);
            reject(new HttpException(str, HttpStatus.NOT_IMPLEMENTED));
          }
          reco.stopContinuousRecognitionAsync();
        };

        // Signals that a new session has started with the speech service
        reco.sessionStarted = function (s, e) { };

        // Signals the end of a session with the speech service.
        reco.sessionStopped = function (s, e) {

          reco.stopContinuousRecognitionAsync();
          reco.close();
        };

        reco.startContinuousRecognitionAsync();
      });

      const result = await recognitionPromise;
      return new ResponseData<any>(result, HttpStatus.OK, 'Đánh giá thành công');

    } catch (error) {
      console.log(error);
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  async save(createPronunciationAssessmentDto: CreatePronunciationAssessmentDto, userId: number) {
    try {
      const { label, score, phones } = createPronunciationAssessmentDto
      const res = await this.prismaService.pronunciationAssessment.create({
        data: {
          userId,
          label,
          score, phonemeAssessments: { create: [...phones] }
        }
      })
      return new ResponseData<any>(res, HttpStatus.OK, 'Lưu thành công')

    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
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
      return new ResponseData<any>(res, HttpStatus.OK, 'Tìm thành công')

    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

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


      return new ResponseData<any>(result, HttpStatus.OK, 'Kết quả thống kê phát âm của người dùng')

    } catch (error) {
      console.log(error);
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }
}
