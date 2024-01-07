import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { SentenceModule } from './sentence/sentence.module';
import { WordModule } from './word/word.module';
import { TypeModule } from './type/type.module';
import { LevelModule } from './level/level.module';
import { TopicModule } from './topic/topic.module';
import { SpecializationModule } from './specialization/specialization.module';
import { ContributionModule } from './contribution/contribution.module';
import { IrregularVerbModule } from './irregular-verb/irregular-verb.module';
import { FavoriteItemModule } from './favorite-item/favorite-item.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailingModule } from './mailing/mailing.module';
import { PracticeModule } from './practice/practice.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, UserModule, SentenceModule, WordModule, TypeModule, LevelModule, TopicModule, SpecializationModule, ContributionModule, IrregularVerbModule, FavoriteItemModule, CloudinaryModule, MailingModule, PracticeModule]
})
export class AppModule {
  static port: number
  constructor(configService: ConfigService) {
    AppModule.port = configService.get('PORT')
  }
}