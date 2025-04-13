import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/index.js';
import { CookieOptions } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
    private cookieOptions: CookieOptions;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.cookieOptions = {
            httpOnly: this.configService.get<string>('COOKIE_HTTP_ONLY') === 'true',
            secure: this.configService.get<string>('COOKIE_SECURE') === 'true',
            sameSite: this.configService.get<string>('COOKIE_SAME_SITE') as CookieOptions['sameSite'],
            signed: this.configService.get<string>('COOKIE_SIGNED') === 'true',
            maxAge: Number(this.configService.get<string>('COOKIE_MAX_AGE')),
            path: this.configService.get<string>('COOKIE_PATH'),
        };
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const response = context.switchToHttp().getResponse();

        return next.handle().pipe(
            tap((data) => {
                response.cookie('access_token', data.userId, this.cookieOptions);
            }));
    }
}