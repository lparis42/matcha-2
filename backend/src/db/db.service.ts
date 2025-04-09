import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import pkg from 'pg';
const { Pool } = pkg;

@Injectable()
export class DatabaseInitService implements OnModuleInit {
    constructor(
        @Inject('DATABASE_POOL')
        private readonly pool: InstanceType<typeof Pool>
    ) { }

    async onModuleInit() {

        const createUsersTableQuery = `
            DROP TABLE IF EXISTS users_pictures;
            DROP TABLE IF EXISTS users_interests;
            DROP TABLE IF EXISTS users;

            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                password VARCHAR(255) NOT NULL,

                gender VARCHAR(255),
                sexual_preferences VARCHAR(255),
                biography VARCHAR(255),

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE users_interests (
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                technology BOOLEAN DEFAULT false,
                sports BOOLEAN DEFAULT false,
                music BOOLEAN DEFAULT false,
                travel BOOLEAN DEFAULT false,
                food BOOLEAN DEFAULT false,
                movies BOOLEAN DEFAULT false,
                books BOOLEAN DEFAULT false,
                art BOOLEAN DEFAULT false,
                nature BOOLEAN DEFAULT false,
                fitness BOOLEAN DEFAULT false,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE users_pictures (
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                picture_1 VARCHAR(255),
                picture_2 VARCHAR(255),
                picture_3 VARCHAR(255),
                picture_4 VARCHAR(255),
                picture_5 VARCHAR(255),

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const createTestUserQuery = `
            INSERT INTO users (email, username, first_name, last_name, password, gender, sexual_preferences, biography)
            VALUES ('user@example.com', 'username1', 'John', 'Doe', 'password123', 'male', 'female', 'Hello world!')
            RETURNING id;

            INSERT INTO users_interests (user_id) VALUES (1);
            INSERT INTO users_pictures (user_id) VALUES (1);
        `;

        await this.pool.query(createUsersTableQuery);
        await this.pool.query(createTestUserQuery);
        Logger.log('Table "users" created successfully!', 'DatabaseInitService');
    }
}