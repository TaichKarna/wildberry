import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { createTestUser, cleanupTestUser } from '../helpers/auth';
import { query } from '../../src/database';

describe('Authentication API', () => {
    let testUser: any;

    before(async () => {
        testUser = await createTestUser('admin');
    });

    after(async () => {
        if (testUser) {
            await cleanupTestUser(testUser.id);
        }
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUser.username,
                    password: 'test123'
                })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.have.property('accessToken');
            expect(response.body.data).to.have.property('refreshToken');
            expect(response.body.data).to.have.property('expiresIn');
        });

        it('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUser.username,
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('INVALID_CREDENTIALS');
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        let refreshToken: string;

        beforeEach(async () => {
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUser.username,
                    password: 'test123'
                });
            refreshToken = loginResponse.body.data.refreshToken;
        });

        it('should refresh token with valid refresh token', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.have.property('accessToken');
            expect(response.body.data).to.have.property('refreshToken');
            expect(response.body.data).to.have.property('expiresIn');
        });

        it('should reject invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken: 'invalid-token' })
                .expect(401);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('INVALID_REFRESH_TOKEN');
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        let accessToken: string;

        beforeEach(async () => {
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUser.username,
                    password: 'test123'
                });
            accessToken = loginResponse.body.data.accessToken;
        });

        it('should successfully logout', async () => {
            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;

            // Verify refresh tokens are removed
            const tokens = await query(
                'SELECT * FROM refresh_tokens WHERE user_id = $1',
                [testUser.id]
            );
            expect(tokens.rows).to.have.length(0);
        });

        it('should reject unauthorized logout', async () => {
            const response = await request(app)
                .post('/api/v1/auth/logout')
                .expect(401);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('UNAUTHORIZED');
        });
    });
});
