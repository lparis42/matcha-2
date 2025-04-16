import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../../db/db.service.js';

export class CookieAuthGuard implements CanActivate {
    constructor(
        private readonly databaseService: DatabaseService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const signedCookies = request.signedCookies;
        // Check if the signed cookies are present and contain the access token
        // If the signed cookies are not present or do not contain the access token, throw an unauthorized exception
        if (!signedCookies || !signedCookies.access_token) {
            throw new HttpException('Access token is missing or invalid!', HttpStatus.UNAUTHORIZED);
        }
        // Check if the access token is a valid integer
        // If the access token is not a valid integer, throw an unauthorized exception
        const userId = Number(signedCookies.access_token);
        if (!userId || !Number.isInteger(userId) || userId <= 0) {
            throw new HttpException('Invalid user ID!', HttpStatus.UNAUTHORIZED);
        }
        // Check if the user exists in the database
        // If the user does not exist, throw an unauthorized exception
        const select = this.databaseService.selectQuery('users', ['id'], `id = '${userId}'`);
        const result = await this.databaseService.execute(select);
        if (result.rowCount === 0) {
            throw new HttpException('User not found!', HttpStatus.UNAUTHORIZED);
        }
        // If the user exists, attach the user id to the request object
        request.body.user = { ...request.body.user, id: userId };
        
        // Return true to indicate that the request is authenticated
        return true;
    }
}