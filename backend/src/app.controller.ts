import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ValidateBody } from './decorator/decorator.body.js';
import { SignUpDto } from './dto/dto.signup.js';
import { SignInDto } from './dto/dto.signin.js';
import { ResetEmailDto } from './dto/dto.resetemail.js';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('sign-up')
  signUp(@ValidateBody(SignUpDto) body: SignUpDto): Promise<string> {
    return this.appService.signUp(body);
  }

  @Post('sign-in')
  signIn(@ValidateBody(SignInDto) body: SignInDto): Promise<string> {
    return this.appService.signIn(body);
  }

  @Post('ask-reset-email')
  askResetEmail(@Body('email') email: string): Promise<string> {
    return this.appService.askResetEmail(email);
  }

  @Post('reset-email')
  resetEmail(@ValidateBody(ResetEmailDto) body: ResetEmailDto): Promise<string> {
    return this.appService.resetEmail(body);
  }
}
