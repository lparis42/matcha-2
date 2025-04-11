import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './db.service.js';
import pkg from 'pg';
const { Pool } = pkg;

@Module({
    providers: [
        {
            provide: 'DATABASE_POOL',
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const pool = new Pool({
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT'),
                    user: configService.get<string>('DB_USERNAME'),
                    password: configService.get<string>('DB_PASSWORD'),
                    database: configService.get<string>('DB_NAME'),
                });
                Logger.log('Database connection established!', 'DatabaseModule');
                return pool;
            },
        },
        DatabaseService,

    ],
    exports: ['DATABASE_POOL'], // Exporter DATABASE_POOL pour d'autres modules
})
export class DatabaseModule { }