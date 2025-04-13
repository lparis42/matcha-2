import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';
import { DatabaseService } from '../db/db.service.js';
import { Pool } from 'pg';

@WebSocketGateway({
    cors: {
        origin: 'https://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(SocketGateway.name);
    private readonly cookieSecret: string;

    constructor(
        private readonly configService: ConfigService,
        @Inject('DATABASE_POOL')
        private readonly pool: InstanceType<typeof Pool>,
        private readonly databaseService: DatabaseService,

    ) {
        this.cookieSecret = this.configService.get<string>('COOKIE_SECRET') || '';
    }

    afterInit(server: Server) {
        this.logger.log('Socket.IO Gateway initialized');
    }

    async handleConnection(client: Socket) {
        // Check if the client has a valid access token in the cookies
        // If the access token is not valid, disconnect the client
        const cookieHeader = client.handshake.headers.cookie;
        if (!cookieHeader) {
            this.logger.error('No cookies found in handshake headers');
            client.disconnect();
            throw new UnauthorizedException('No cookies found in handshake headers');
        }
        // Parse the cookies from the cookie header and check if the access token is present
        // If the access token is not present, disconnect the client
        const cookies = cookie.parse(cookieHeader);
        const signed = cookies['access_token'];
        if (!signed || !signed.startsWith('s:')) {
            this.logger.error('No valid signed access token found');
            client.disconnect();
            throw new UnauthorizedException('No valid signed access token found');
        }
        // Unsigned the access token and check if it is valid
        // If the access token is not valid, disconnect the client
        const unsigned = signature.unsign(signed.slice(2), this.cookieSecret);
        if (!unsigned) {
            this.logger.error('Invalid cookie signature');
            client.disconnect();
            throw new UnauthorizedException('Invalid cookie signature');
        }
        // Parse the unsigned access token and check if it is a valid integer
        // If the access token is not a valid integer, disconnect the client
        const userId = Number(unsigned);
        if (!userId) {
            this.logger.error('Invalid access token');
            client.disconnect();
            throw new UnauthorizedException('Invalid access token');
        }
        // Check if the token is a valid integer
        // If the token is not a valid integer, throw an unauthorized exception
        if (!userId || !Number.isInteger(userId) || userId <= 0) {
            throw new UnauthorizedException('Invalid user ID');
        }
        // Check if the user exists in the database
        // If the user does not exist, throw an unauthorized exception
        const select = this.databaseService.selectQuery('users', ['id'], `id = '${userId}'`);
        const result = await this.pool.query(select);
        if (result.rowCount === 0) {
            throw new UnauthorizedException('User not found');
        }
        // Attach the user ID to the client object for later use
        client.data.userId = userId;
        this.logger.log(`Client authenticated: ${userId}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    sendMessageToClient(client: Socket, message: string) {
        client.emit('message', { text: message });
    }

    broadcastMessage(message: string) {
        this.server.emit('message', { text: message });
    }
}
