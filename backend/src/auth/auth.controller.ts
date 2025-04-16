import { Controller, Post, Get, UseGuards, Req, UseInterceptors, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ValidateBody } from '../decorator/decorator.body.js';
import { SignUpDto } from './dto/dto.signup.js';
import { SignInDto } from './dto/dto.signin.js';
import { AuthGuard } from '@nestjs/passport/index.js';
import { Request } from 'express';
import { CookieInterceptor } from './interceptors/interceptor.cookie.js';
import { CookieAuthGuard } from './guards/guard.cookie.js';
import { UUIDDto } from './dto/dto.UUID.js';
import { EmailDto } from './dto/dto.email.js';
import { PasswordDto } from './dto/dto.password.js';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

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

    @Get('verify-email')
    async verifyEmail(
        @Query() query: UUIDDto,
    ): Promise<{ message: string }> {
        const result = await this.authService.verifyEmail(query);
        return result;
    }

    @Post('forgot-password')
    async forgotPassword(
        @ValidateBody(EmailDto) body: EmailDto,
    ): Promise<{ message: string }> {
        const result = await this.authService.forgotPassword(body);
        return result;
    }

    @Post('reset-password')
    async resetPassword(
        @ValidateBody(PasswordDto) body: PasswordDto,
        @Query() query: UUIDDto,
    ): Promise<{ message: string }> {
        const result = await this.authService.resetPassword(body, query);
        return result;
    }

    // OAuth endpoints

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

    // Testing endpoints

    @Post('auto-sign-in')
    @UseGuards(CookieAuthGuard)
    async autoSignIn(
        @Req() req: Request,
    ): Promise<{ userId: number, message: string }> {
        return { userId: req.user!.id!, message: 'User signed in successfully!' };
    }

    @Post('sign-up-no-email-verification')
    async signUpNoEmailVerification(
        @ValidateBody(SignUpDto) body: SignUpDto
    ): Promise<{ message: string }> {
        const result = await this.authService.signUpNoEmailVerification(body);
        return result;
    }
}
