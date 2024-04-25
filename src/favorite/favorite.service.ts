import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ToggleFavoriteDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE, ResponseData } from '../global';

interface ToggleFavorites {
  Word?: { connect?: { id: number }, disconnect?: { id: number } }
}

@Injectable()
export class FavoriteService {

  constructor(private prismaService: PrismaService) { }

  // async findFavoritesByUserId(userId: number) {
  //   // const user = await this.prismaService.user.findUnique({ where: { id: userId, isDeleted: false }, include: { FavoriteList: true } })
  //   // return await this.prismaService.favoriteItem.findUnique({ where: { id: user.FavoriteList[0].id }, include: { Word: true, Sentence: true } })
  //   return await this.prismaService.favorite.findMany({
  //     where: {
  //       userId: userId,
  //     },
  //     include: {
  //       // Word: {
  //       //   include: {
  //       //     Topic: true,
  //       //     Level: true,
  //       //     Specialization: true,
  //       //     meanings: {
  //       //       include: {
  //       //         Type: true
  //       //       }
  //       //     }
  //       //   }
  //       // }
  //       Word: true
  //     }
  //   })
  // }

  async toggleFavorite(toggleFavoriteDto: ToggleFavoriteDto, userId: number) {
    try {
      const { wordId } = toggleFavoriteDto
      const favorite = await this.prismaService.favorite.findFirst({
        where: {
          userId: userId,
          wordId: wordId
        }
      })
      if (favorite) {
        await this.prismaService.favorite.delete({
          where: {
            id: favorite.id
          }
        })
        return new ResponseData<any>(favorite, HttpStatus.OK, 'Đã xóa từ ra khỏi danh sách yêu thích')
      } else {
        const res = await this.prismaService.favorite.create({
          data: {
            userId: userId,
            wordId: wordId
          }
        })
        return new ResponseData<any>(res, HttpStatus.OK, 'Đã thêm từ vào danh sách yêu thích')
      }
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllByUserId(userId: number, sort: any, key: string, page: number) {
    const pageSize = PAGE_SIZE.PAGE_FAVORITE
    try {
      const totalCount = await this.prismaService.favorite.findMany({
        where: {
          userId: userId,
        },
        include: {
          Word: {
            where: { content: { contains: key, mode: 'insensitive' } }
          }
        }
      })

      let totalPages = Math.ceil(totalCount.length / pageSize)
      if (!totalPages) totalPages = 1
      if (!page || page < 1) page = 1
      if (page > totalPages) page = totalPages
      let next = (page - 1) * pageSize
      const data = await this.prismaService.favorite.findMany({
        where: {
          userId: userId,
        },
        take: pageSize,
        skip: next,
        orderBy: {
          id: sort
        },
        include: {
          Word: {
            where: { content: { contains: key } },
            include: {
              Topic: true,
              Level: true,
              Specialization: true,
              meanings: {
                include: {
                  Type: true
                }
              }
            }
          }
        }
      })
      return new ResponseData<any>({ data, totalPages, total: totalCount.length }, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkIsFavorite(userId: number, wordId: number) {
    try {
      const result = await this.prismaService.favorite.findFirst({
        where: {
          userId: userId,
          wordId: wordId
        }
      })

      // return new ResponseData<any>({ result: result.Word.length == 1 }, HttpStatus.OK, 'Kiểm tra thành công')
      return new ResponseData<any>({ result: result ? true : false }, HttpStatus.OK, 'Kiểm tra thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // async findAllByUser(userId: number) {
  //   try {
  //     const data = await this.prismaService.favoriteItem.findFirst({
  //       where: {
  //         userId: userId,
  //       },
  //       include: {
  //         Word: {
  //           select: {
  //             id: true
  //           }
  //         }
  //       }
  //     })
  //     return new ResponseData<Favorite>(data, HttpStatus.OK, 'Tìm thành công')
  //   } catch (error) {
  //     throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}
