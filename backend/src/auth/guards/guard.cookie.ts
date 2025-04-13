import { CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../../db/db.service.js';
import { Pool } from 'pg';

export class CookieAuthGuard implements CanActivate {
    constructor(
        @Inject('DATABASE_POOL')
        private readonly pool: InstanceType<typeof Pool>,
        private readonly databaseService: DatabaseService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const signedCookies = request.signedCookies;
        // Check if the signed cookies are present and contain the access token
        // If the signed cookies are not present or do not contain the access token, throw an unauthorized exception
        if (!signedCookies || !signedCookies.access_token) {
            throw new UnauthorizedException('Access token is missing or invalid!');
        }
        // Check if the access token is a valid integer
        // If the access token is not a valid integer, throw an unauthorized exception
        const userId = Number(signedCookies.access_token);
        if (!userId || !Number.isInteger(userId) || userId <= 0) {
            throw new UnauthorizedException('Invalid user ID!');
        }
        // Check if the user exists in the database
        // If the user does not exist, throw an unauthorized exception
        const select = this.databaseService.selectQuery('users', ['id'], `id = '${userId}'`);
        const result = await this.pool.query(select);
        if (result.rowCount === 0) {
            throw new UnauthorizedException('User not found!');
        }
        // If the user exists, attach the user id to the request object
        request.user = { id: Number(userId) };
        
        // Return true to indicate that the request is authenticated
        return true;
    }
}