import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: configService.get<string>('FORTYTWO_CLIENT_ID') || '',
      clientSecret: configService.get<string>('FORTYTWO_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('FORTYTWO_CALLBACK_URL') || '',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('Profile:', profile);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      profile: {
        id: profile.id,
        username: profile.login,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        picture: profile.image?.link,
      },
    }
  }
}