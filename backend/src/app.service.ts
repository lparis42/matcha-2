import { Injectable } from '@nestjs/common';

interface User {
  email: string;
  password: string;
}

@Injectable()
export class AppService {
  private users: User[] = [];

  signUp(signUpDto: any): string {
    const user: User = { email: signUpDto.email, password: signUpDto.password };
    this.users.push(user);
    return 'User signed up successfully!';
  }

  signIn(signInDto: any): string {
    const user = this.users.find(u => u.email === signInDto.email);

    if (!user || user.password !== signInDto.password) {
      throw new Error('Invalid credentials');
    }

    return 'User signed in successfully!';
  }

  resetEmail(resetEmailDto: any): string {
    const user = this.users.find(u => u.email === resetEmailDto.oldEmail);

    if (!user) {
      throw new Error('User not found');
    }

    user.email = resetEmailDto.newEmail;
    return 'Email reset successfully!';
  }
}
