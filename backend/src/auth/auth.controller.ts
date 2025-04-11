import { Controller, Post, Body, Get, UseGuards, Logger, Req, Res, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ValidateBody } from '../decorator/decorator.body.js';
import { SignUpDto } from './dto/dto.signup.js';
import { SignInDto } from './dto/dto.signin.js';
import { ResetEmailDto } from './dto/dto.resetemail.js';
import { AuthGuard } from '@nestjs/passport/index.js';
import { Request, Response } from 'express';
import { User } from '../interfaces/interface.user.js';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('sign-up')
    signUp(
        @ValidateBody(SignUpDto) body: SignUpDto
    ): Promise<string> {
        return this.authService.signUp(body);
    }

    @Post('sign-in')
    signIn(
        @ValidateBody(SignInDto) body: SignInDto
    ): Promise<string> {
        return this.authService.signIn(body);
    }

    @Post('ask-reset-email')
    askResetEmail(
        @Body('email') email: string
    ): Promise<string> {
        return this.authService.askResetEmail(email);
    }

    @Post('reset-email')
    resetEmail(
        @ValidateBody(ResetEmailDto) body: ResetEmailDto
    ): Promise<string> {
        return this.authService.resetEmail(body);
    }

    // Oauth 42 endpoints

    @Get('42')
    @UseGuards(AuthGuard('42'))
    fortyTwoAuthorize() {
        Logger.log('Redirecting to 42 authorization...', 'AuthController');
        return null;
    }

    @Get('42/callback')
    @UseGuards(AuthGuard('42'))
    fortyTwoCallback(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<string> {
        const user = req.user as User;
        if (!user) {
            throw new NotFoundException('User not found in the request!');
        }

        res.cookie('auth_token', 'test', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
        });

        const profile = user.profile;
        return this.authService.fortyTwoConnect(profile);
    }
}
