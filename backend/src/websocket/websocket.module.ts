import { Module } from '@nestjs/common';
import { SocketGateway } from './websocket.gateway.js';
import { ConfigModule } from '@nestjs/config/index.js';
import { DatabaseModule } from '../db/db.module.js';

@Module({
    imports: [ConfigModule, DatabaseModule, DatabaseModule],
    providers: [SocketGateway],
})
export class WebSocketModule { } 