import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ToggleFavoritesListDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_SIZE, ResponseData } from '../global';
import { FavoriteItem } from '@prisma/client';

interface ToggleFavorites {
  Word?: { connect?: { id: number }, disconnect?: { id: number } }
}

@Injectable()
export class FavoriteItemService {

  constructor(private prismaService: PrismaService) { }

  async findFavoritesByUserId(userId: number) {
    const user = await this.prismaService.user.findUnique({ where: { id: userId, isDeleted: false }, include: { FavoriteList: true } })
    return await this.prismaService.favoriteItem.findUnique({ where: { id: user.FavoriteList[0].id }, include: { Word: true, Sentence: true } })
  }

  async toggleFavoritesList(toggleFavoritesListDto: ToggleFavoritesListDto, userId: number) {
    try {
      const { wordId } = toggleFavoritesListDto
      const favoriteItem = await this.findFavoritesByUserId(userId)
      const toggleFavorites: ToggleFavorites = {}
      let message = ''
      if (favoriteItem.Word.some((item) => item.id == wordId)) {
        toggleFavorites.Word = { disconnect: { id: wordId } };
        message = 'Đã xóa từ ra khỏi danh sách yêu thích'
      } else {
        toggleFavorites.Word = { connect: { id: wordId } };
        message = 'Đã thêm từ vào danh sách yêu thích'
      }
      const newFavoriteItem = await this.prismaService.favoriteItem.update({
        where: { id: favoriteItem.id },
        data: toggleFavorites
      })
      // if (!newFavoriteItem) return new ResponseData<FavoriteItem>(null, 400, 'T yêu thích thất bại')
      return new ResponseData<FavoriteItem>(newFavoriteItem, HttpStatus.OK, message)
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllByUserId(userId: number, sort: any, key: string, page: number) {
    const pageSize = PAGE_SIZE.PAGE_FAVORITE
    try {
      const total = await this.prismaService.favoriteItem.findFirst({
        where: {
          userId: userId,
        },
        include: {
          Word: {
            where: { content: { contains: key } }
          }
        }
      })
      const totalCount = total.Word.length
      let totalPages = Math.ceil(totalCount / pageSize)
      if (!totalPages) totalPages = 1
      if (!page || page < 1) page = 1
      if (page > totalPages) page = totalPages
      let next = (page - 1) * pageSize
      const data = await this.prismaService.favoriteItem.findFirst({
        where: {
          userId: userId,
        },
        include: {
          Word: {
            where: { content: { contains: key } },
            take: pageSize,
            skip: next,
            orderBy: {
              content: sort
            },
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
      return new ResponseData<any>({ results: data, totalPages }, HttpStatus.OK, 'Tìm thành công')
    } catch (error) {
      throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkIsFavorite(userId: number, wordId: number) {
    try {
      const result = await this.prismaService.favoriteItem.findFirst({
        where: {
          userId: userId,
        }, include: {
          Word: {
            where: {
              id: wordId
            }
          }
        }
      })

      return new ResponseData<any>({ result: result.Word.length == 1 }, HttpStatus.OK, 'Kiểm tra thành công')
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
  //     return new ResponseData<FavoriteItem>(data, HttpStatus.OK, 'Tìm thành công')
  //   } catch (error) {
  //     throw new HttpException(error.response || 'Lỗi dịch vụ, thử lại sau', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}