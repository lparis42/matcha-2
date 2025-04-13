import { Controller, Post, Body, Get, UseGuards, Logger, Req, Res, NotFoundException, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ValidateBody } from '../decorator/decorator.body.js';
import { SignUpDto } from './dto/dto.signup.js';
import { SignInDto } from './dto/dto.signin.js';
import { ResetEmailDto } from './dto/dto.resetemail.js';
import { AuthGuard } from '@nestjs/passport/index.js';
import { Request } from 'express';
import { AskResetEmailDto } from './dto/dto.askresetemail.js';
import { CookieInterceptor } from './interceptors/interceptor.cookie.js';
import { CookieAuthGuard } from './guards/guard.cookie.js';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('auto-sign-in')
    @UseGuards(CookieAuthGuard)
    async autoSignIn(
        @Req() req: Request,
    ): Promise<{ userId: number, message: string }> {
        return { userId: req.user!.id!, message: 'User signed in successfully!' };
    }

    @Post('sign-up')
    async signUp(
        @ValidateBody(SignUpDto) body: SignUpDto
    ): Promise<{ message: string }> {
        const result = await this.authService.signUp(body);
        return result;
    }

    @Post('sign-in')
    @UseInterceptors(CookieInterceptor)
    async signIn(
        @ValidateBody(SignInDto) body: SignInDto,
    ): Promise<{ userId: number, message: string }> {
        const result = await this.authService.signIn(body);
        return result;
    }

    @Post('ask-reset-email')
    async askResetEmail(
        @ValidateBody(AskResetEmailDto) body: AskResetEmailDto
    ): Promise<{ message: string }> {
        const result = await this.authService.askResetEmail(body);
        return result;
    }

    @Post('reset-email')
    async resetEmail(
        @ValidateBody(ResetEmailDto) body: ResetEmailDto
    ): Promise<{ message: string }> {
        const result = await this.authService.resetEmail(body);
        return result;
    }

    // Oauth 42 endpoints with passport

    @Get('42')
    @UseGuards(AuthGuard('42'))
    fortyTwoAuthorize() { }

    @Get('42/callback')
    @UseGuards(AuthGuard('42'))
    @UseInterceptors(CookieInterceptor)
    async fortyTwoCallback(
        @Req() req: Request,
    ): Promise<{ message: string }> {
        const result = await this.authService.fortyTwoConnect(req.user!);
        return result;
    }
}
