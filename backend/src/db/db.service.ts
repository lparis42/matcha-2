import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import pkg from 'pg';
const { Pool } = pkg;

@Injectable()
export class DatabaseInitService implements OnModuleInit {
    constructor(
        @Inject('DATABASE_POOL')
        private readonly pool: InstanceType<typeof Pool>
    ) { }

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
}