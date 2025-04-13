import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

    this.userProfile = async (accessToken: string, done: Function) => {
      try {
        const { data } = await axios.get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        done(null, data);
      } catch (error) {
        done(error, null);
      }
    };
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    return {
      fortytwo_id: profile.id,
      email: profile.email,
      username: profile.login,
      first_name: profile.first_name,
      last_name: profile.last_name,
      picture: profile.image?.link,
    };
  }
}