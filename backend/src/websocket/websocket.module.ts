import { Module } from '@nestjs/common';
import { SocketGateway } from './websocket.gateway.js';
import { ConfigModule } from '@nestjs/config/index.js';
import { DatabaseModule } from '../db/db.module.js';
import { DatabaseService } from '../db/db.service.js';

@Module({
    imports: [ConfigModule, DatabaseModule],
    providers: [SocketGateway, DatabaseService],
})
export class WebSocketModule { } 