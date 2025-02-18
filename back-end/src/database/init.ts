import fs from 'fs';
import path from 'path';
import { query } from '.';

export async function initializeDatabase() {
    try {
        const migrationPath = path.join(__dirname, 'migrations', '001_create_customers.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await query(sql);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}
