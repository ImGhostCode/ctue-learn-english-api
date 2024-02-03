import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService) {
        super({
            datasources: {
                db: {
                    url: configService.get('DATABASE_URL')
                }
            }
        })

        this.$use(async (params, next) => {
            if (params.model == 'Contribution' || params.model == 'IrregularVerb' || params.model == 'Account' || params.model == 'Sentence' || params.model == 'User' || params.model == 'Word' || params.model == 'VocabularySet') {

                if (params.action == 'delete') {
                    // Delete queries
                    // Change action to an update
                    params.action = 'update'
                    params.args['data'] = { isDeleted: true }
                }
                if (params.action == 'deleteMany') {
                    // Delete many queries
                    params.action = 'updateMany'
                    if (params.args.data != undefined) {
                        params.args.data['isDeleted'] = true
                    } else {
                        params.args['data'] = { isDeleted: true }
                    }
                }
            }

            // Continue with the operation
            return next(params);
        }
        );
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}