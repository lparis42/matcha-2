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

        // For testing purposes, we can create a test user with default insertValues.
        const insertQuery = this.insertQuery(
            'users',
            ['email', 'username', 'first_name', 'last_name', 'password', 'date_of_birth', 'gender', 'sexual_preferences', 'biography'],
            ['user@example.com', 'username1', 'John', 'Doe', 'password123', '1990-01-01', 'male', 'heterosexual', 'Hello world!']
        );
        // Log the query and params for debugging
        console.log('Executing query:', insertQuery.query);
        console.log('With params:', insertQuery.params);
        await this.execute(insertQuery.query, insertQuery.params);

        const select = this.selectQuery('users', [], []);
        // Log the query and params for debugging
        console.log('Executing query:', select.query);
        console.log('With params:', select.params);
        const result = await this.execute(select.query, select.params);
        if (result.rowCount === 0) {
            Logger.error('No users found in the database.', 'DatabaseInitService');
            return;
        }
        Logger.log(`Found ${result.rowCount} users in the database.`, 'DatabaseInitService');
        console.log('Users:', result.rows); // Log the users to the console for testing
    }

    execute(query: string, params: any[] = []): Promise<any> {
        return this.pool.query(query, params);
    }

    beginTransaction(): Promise<any> {
        return this.pool.query('BEGIN');
    }
    commitTransaction(): Promise<any> {
        return this.pool.query('COMMIT');
    }
    rollbackTransaction(): Promise<any> {
        return this.pool.query('ROLLBACK');
    }

    selectQuery(table: string, columnNames: string[], whereParams: any[]): { query: string, params: any[] } {
        const whereClause = whereParams.map((_, index) => `${columnNames[index]} = $${index + 1}`).join(' AND ');
        const safeTableName = `"${table.replace(/"/g, '""')}"`;
        const safeColumnNames = columnNames.length === 0 ? ['*'] : columnNames.map(col => `"${col.replace(/"/g, '""')}"`);
        if (whereClause.length === 0) {
            const query = `SELECT ${safeColumnNames.join(', ')} FROM ${safeTableName}`;
            return { query, params: whereParams };
        }
        const query = `SELECT ${safeColumnNames.join(', ')} FROM ${safeTableName} WHERE ${whereClause}`;
        return { query, params: whereParams };
    }

    insertQuery(table: string, columnNames: string[], insertValues: any[]): { query: string, params: any[] } {
        const whereClause = insertValues.map((_, index) => `$${index + 1}`).join(', ');
        const safeTableName = `"${table.replace(/"/g, '""')}"`;
        const safeColumnNames = columnNames.map(col => `"${col.replace(/"/g, '""')}"`);
        const query = `INSERT INTO ${safeTableName} (${safeColumnNames.join(', ')}) VALUES (${whereClause})`;
        return { query, params: insertValues };
    }

    updateQuery(table: string, columnNames: string[], insertValues: any[], whereParams: any[]): { query: string, params: any[] } {
        const setClause = columnNames.map((col, index) => `${col} = $${index + 1}`).join(', ');
        const whereClause = whereParams.map((_, index) => `${columnNames[index]} = $${index + columnNames.length + 1}`).join(' AND ');
        const safeTableName = `"${table.replace(/"/g, '""')}"`;
        const query = `UPDATE ${safeTableName} SET ${setClause} WHERE ${whereClause}`;
        return { query, params: [...insertValues, ...whereParams] };
    }

    deleteQuery(table: string, whereParams: any[]): { query: string, params: any[] } {
        const whereClause = whereParams.map((_, index) => `$${index + 1}`).join(' AND ');
        const safeTableName = `"${table.replace(/"/g, '""')}"`;
        const query = `DELETE FROM ${safeTableName} WHERE ${whereClause}`;
        return { query, params: whereParams };
    }

}