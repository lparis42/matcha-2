import fs from 'fs';
import { AppModule } from './app.module.js';
import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

class Server {
    private app!: INestApplication;

    public async bootstrap(): Promise<void> {
        this.app = await NestFactory.create(AppModule, await this.getOptions());
        this.app.setGlobalPrefix('api');
        await this.app.listen(this.getHttpsPort(), () => {
            new Logger(Server.name).log(`Server is running on port ${this.getHttpsPort()}`);
        });
    }

    private async getOptions(): Promise<NestApplicationOptions> {
        const key = fs.readFileSync('server.key');
        const cert = fs.readFileSync('server.crt');
        const options = {
            httpsOptions: { key, cert },
            // bodyParser: false,
        };
        return options;
    }

    private getHttpsPort(): number {
        const configService = this.app.get(ConfigService);
        const httpsPort = Number(configService.get<string>('HTTPS_PORT'));
        return httpsPort;
    }
}

export default Server;