import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
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

    afterInit(server: Server): void {
        this.logger.log('Socket.IO Gateway initialized');

        server.use(async (socket, next) => {
            // Check if the request has a cookie header
            // If not, return an error
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) {
                // this.logger.error('Cookie header is missing');
                // return next(new HttpException('Cookie header is missing', HttpStatus.BAD_REQUEST));
                return;
            }
            // Parse the cookie header and check for the access token
            // If the access token is not found, return an error
            const cookies = cookie.parse(cookieHeader);
            const signed = cookies['access_token'];
            if (!signed || !signed.startsWith('s:')) {
                this.logger.error('No valid signed access token found');
                return next(new HttpException('No valid signed access token found', HttpStatus.UNAUTHORIZED));
            }
            // Verify the access token using the cookie secret
            // If the access token is invalid, return an error
            const unsigned = signature.unsign(signed.slice(2), this.cookieSecret);
            if (!unsigned) {
                this.logger.error('Invalid cookie signature');
                return next(new HttpException('Invalid cookie signature', HttpStatus.UNAUTHORIZED));
            }
            // Parse the unsigned access token and check if it is a valid user ID
            // If the user ID is not valid, return an error
            const userId = Number(unsigned);
            if (!userId || !Number.isInteger(userId) || userId <= 0) {
                this.logger.error('Invalid access token');
                return next(new HttpException('Invalid access token', HttpStatus.UNAUTHORIZED));
            }
            // Check if the user ID exists in the database
            // If the user ID does not exist, return an error
            const select = this.databaseService.selectQuery('users', ['id'], `id = '${userId}'`);
            const result = await this.pool.query(select);
            if (result.rowCount === 0) {
                this.logger.error('User not found');
                return next(new HttpException('User not found', HttpStatus.UNAUTHORIZED));
            }
            // If the user ID is valid, attach it to the socket object and call next()
            socket.data.userId = userId;
            next();
        });
    }

    handleConnection(client: Socket): void {
        const userId = client.data.userId;
        this.logger.log(`User '${userId}' connected to WebSocket`);

        // Testing the connection
        this.broadcastMessage(`User '${userId}' has joined the chat`);
    }

    handleDisconnect(client: Socket): void {
        const userId = client.data.userId; 
        this.logger.log(`User '${userId}' disconnected from WebSocket`);
    }

    sendMessageToClient(client: Socket, message: string): void {
        client.emit('message', { text: message });
    }

    broadcastMessage(message: string): void {
        this.server.emit('message', { text: message });
    }
}
