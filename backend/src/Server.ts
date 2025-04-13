import fs from 'fs';
import { AppModule } from './app.module.js';
import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

class Server {
    private app!: INestApplication;

    public async bootstrap(): Promise<void> {
        this.app = await NestFactory.create(AppModule, await this.getOptions());
        this.app.use(cookieParser(this.app.get(ConfigService).get<string>('COOKIE_SECRET')));
        this.app.setGlobalPrefix('api');
        await this.app.listen(this.getHttpsPort(), () => {
            new Logger(Server.name).log(`Server is running on port ${this.getHttpsPort()}`);
        });
    }

    private async getOptions(): Promise<NestApplicationOptions> {
        const key = fs.readFileSync('https.key');
        const cert = fs.readFileSync('https.crt');
        const options = { httpsOptions: { key, cert } };
        return options;
    }

    private getHttpsPort(): number {
        const configService = this.app.get(ConfigService);
        const httpsPort = Number(configService.get<string>('HTTPS_PORT'));
        return httpsPort;
    }
}

export default Server;