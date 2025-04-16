import { Controller, Post, Body, Get, UseGuards, Logger, Req, Res, NotFoundException, UseInterceptors, Query } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ValidateBody } from '../decorator/decorator.body.js';
import { SignUpDto } from './dto/dto.signup.js';
import { SignInDto } from './dto/dto.signin.js';
import { ChangePasswordDto } from './dto/dto.changePassword.js';
import { AuthGuard } from '@nestjs/passport/index.js';
import { Request } from 'express';
import { ResetPasswordDto } from './dto/dto.resetPassword.js';
import { CookieInterceptor } from './interceptors/interceptor.cookie.js';
import { CookieAuthGuard } from './guards/guard.cookie.js';
import { VerifyEmailDto } from './dto/dto.verifyEmail.js';
import { request } from 'axios/index.cjs';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    // Auto sign-in endpoint for testing purposes
    // @Post('auto-sign-in')
    // @UseGuards(CookieAuthGuard)
    // async autoSignIn(
    //     @Req() req: Request,
    // ): Promise<{ userId: number, message: string }> {
    //     return { userId: req.user!.id!, message: 'User signed in successfully!' };
    // }

    @Post('sign-up')
    async signUp(
        @ValidateBody(SignUpDto) body: SignUpDto
    ): Promise<{ message: string }> {
        const result = await this.authService.signUp(body);
        return result;
    }

    @Post('sign-up-no-email-verification')
    async signUpNoEmailVerification(
        @ValidateBody(SignUpDto) body: SignUpDto
    ): Promise<{ message: string }> {
        const result = await this.authService.signUpNoEmailVerification(body);
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

    @Get('verify-email')
    async verifyEmail(
        @Query() query: VerifyEmailDto
    ): Promise<{ message: string }> {
        const result = await this.authService.verifyEmail(query);
        return result;
    }

    @Post('reset-password')
    async askResetEmail(
        @ValidateBody(ResetPasswordDto) body: ResetPasswordDto
    ): Promise<{ message: string }> {
        const result = await this.authService.resetPassword(body);
        return result;
    }

    @Post('change-password')
    @UseGuards(CookieAuthGuard)
    async changePassword(
        @ValidateBody(ChangePasswordDto) body: ChangePasswordDto
    ): Promise<{ message: string }> {
        const result = await this.authService.changePassword(body);
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
