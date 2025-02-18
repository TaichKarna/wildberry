import jwt from 'jsonwebtoken';
import { config } from '../../src/config';
import { query } from '../../src/database';
import bcrypt from 'bcrypt';

export async function createTestUser(role: string = 'admin') {
    const hashedPassword = await bcrypt.hash('test123', 10);
    const result = await query(
        `INSERT INTO users (username, password_hash, role, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, role`,
        [`test_user_${Date.now()}`, hashedPassword, role, 'active']
    );
    return result.rows[0];
}

export function generateTestToken(user: { id: number; username: string; role: string }) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.jwtSecret,
        { expiresIn: '1h' }
    );
}

export async function createTestApiKey(appId: string, type: 'public' | 'private' = 'private') {
    const result = await query(
        `INSERT INTO api_keys (key_value, name, app_id, type, permissions, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            `${type}_test_${Date.now()}`,
            'Test API Key',
            appId,
            type,
            type === 'private' ? ['read:all', 'write:all'] : ['read:products', 'read:offerings'],
            'active'
        ]
    );
    return result.rows[0];
}

export async function cleanupTestUser(userId: number) {
    await query('DELETE FROM users WHERE id = $1', [userId]);
}

export async function cleanupTestApiKey(keyId: string) {
    await query('DELETE FROM api_keys WHERE id = $1', [keyId]);
}
