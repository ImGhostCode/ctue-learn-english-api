import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (confirmService: ConfigService) => ({
        transport: {
          host: confirmService.get('MAIL_HOST'),
          secure: false,
          auth: {
            user: confirmService.get('MAIL_USER'),
            pass: confirmService.get('MAIL_PASS')
          }
        },
        defaults: {
          from: `Ứng dụng hỗ trợ học tiếng anh`
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      }),
      inject: [ConfigService],
    })
  ]
})

export class MailingModule { }