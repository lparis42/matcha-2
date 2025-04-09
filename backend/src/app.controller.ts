import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('sign-up')
  signUp(@Body() signUpDto: any): string {
    // Replace with actual sign-up logic
    return this.appService.signUp(signUpDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: any): string {
    // Replace with actual sign-in logic
    return this.appService.signIn(signInDto);
  }

  @Post('reset-email')
  resetEmail(@Body() resetEmailDto: any): string {
    // Replace with actual reset email logic
    return this.appService.resetEmail(resetEmailDto);
  }
}
