import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import pkg from 'pg';
const { Pool } = pkg;

@Injectable()
export class DatabaseService implements OnModuleInit {
    private readonly pool: InstanceType<typeof Pool>;

    constructor(private readonly configService: ConfigService) {
        this.pool = new Pool({
            host: this.configService.get<string>('DB_HOST'),
            port: this.configService.get<number>('DB_PORT'),
            user: this.configService.get<string>('DB_USERNAME'),
            password: this.configService.get<string>('DB_PASSWORD'),
            database: this.configService.get<string>('DB_NAME'),
        });
        Logger.log('Database connection established!', 'DatabaseService');
    }
    async onModuleInit() {

        const dropUsersTableQuery = readFileSync(
            join('src', 'db', 'sql', 'drop_users.sql'),
            'utf8'
        );
        const createUsersTableQuery = readFileSync(
            join('src', 'db', 'sql', 'create_users.sql'),
            'utf8'
        );
        await this.pool.query(dropUsersTableQuery);
        await this.pool.query(createUsersTableQuery);
        Logger.log('Table "users" created successfully!', 'DatabaseInitService');

        // For testing purposes, we can create a test user with default values.
        const createTestUserQuery = `
            INSERT INTO users (email, username, first_name, last_name, password, gender, sexual_preferences, biography)
            VALUES ('user@example.com', 'username1', 'John', 'Doe', 'password123', 'male', 'female', 'Hello world!')
            RETURNING *;
        `;
        await this.pool.query(createTestUserQuery);
    }

    query(query: string, params: any[] = []): Promise<any> {
        return this.pool.query(query, params);
    }

    selectQuery(table: string, columns: string[], where: string): string {
        return `SELECT ${columns.join(', ')} FROM ${table} WHERE ${where}`;
    } 

    insertQuery(table: string, columns: string[], values: any[]): { query: string; params: any[] } {
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
        const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        return { query, params: values };
    }

    updateQuery(table: string, set: string[], where: string, values: any[]): { query: string; params: any[] } {
        const setClause = set.map((column, index) => `${column} = $${index + 1}`).join(', ');
        const query = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
        return { query, params: values };
    }

    deleteQuery(table: string, where: string, values: any[]): { query: string; params: any[] } {
        const query = `DELETE FROM ${table} WHERE ${where}`;
        return { query, params: values };
    }
}