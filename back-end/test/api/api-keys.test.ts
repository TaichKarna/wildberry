import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { createTestUser, generateTestToken, cleanupTestUser, createTestApiKey, cleanupTestApiKey } from '../helpers/auth';
import { query } from '../../src/database';

describe('API Keys API', () => {
    let testUser: any;
    let accessToken: string;
    let testApp: any;
    let testApiKey: any;

    before(async () => {
        testUser = await createTestUser('admin');
        accessToken = generateTestToken(testUser);

        // Create a test app
        const appResult = await query(
            `INSERT INTO apps (name, bundle_id, platform)
             VALUES ($1, $2, $3)
             RETURNING *`,
            ['Test App', 'com.test.app', 'ios']
        );
        testApp = appResult.rows[0];
    });

    after(async () => {
        if (testUser) {
            await cleanupTestUser(testUser.id);
        }
        if (testApp) {
            await query('DELETE FROM apps WHERE id = $1', [testApp.id]);
        }
        if (testApiKey) {
            await cleanupTestApiKey(testApiKey.id);
        }
    });

    describe('POST /api/v1/api-keys/public', () => {
        it('should create a public API key', async () => {
            const response = await request(app)
                .post('/api/v1/api-keys/public')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Test Public Key',
                    appId: testApp.id,
                    permissions: ['read:products', 'read:offerings']
                })
                .expect(201);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.have.property('id');
            expect(response.body.data).to.have.property('key');
            expect(response.body.data.key).to.include('pub_');
            expect(response.body.data.type).to.equal('public');

            testApiKey = response.body.data;
        });
    });

    describe('POST /api/v1/api-keys/private', () => {
        it('should create a private API key', async () => {
            const response = await request(app)
                .post('/api/v1/api-keys/private')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Test Private Key',
                    appId: testApp.id,
                    permissions: ['read:all', 'write:all']
                })
                .expect(201);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.have.property('id');
            expect(response.body.data).to.have.property('key');
            expect(response.body.data.key).to.include('priv_');
            expect(response.body.data.type).to.equal('private');
        });
    });

    describe('GET /api/v1/api-keys', () => {
        it('should list API keys with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/api-keys')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.meta).to.have.property('total');
            expect(response.body.meta).to.have.property('page', 1);
            expect(response.body.meta).to.have.property('limit', 10);
        });

        it('should filter API keys by type', async () => {
            const response = await request(app)
                .get('/api/v1/api-keys')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ type: 'public' })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0].type).to.equal('public');
        });
    });

    describe('GET /api/v1/api-keys/:id', () => {
        it('should get API key details', async () => {
            const response = await request(app)
                .get(`/api/v1/api-keys/${testApiKey.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.id).to.equal(testApiKey.id);
            expect(response.body.data.name).to.equal(testApiKey.name);
        });
    });

    describe('PATCH /api/v1/api-keys/:id', () => {
        it('should update API key', async () => {
            const response = await request(app)
                .patch(`/api/v1/api-keys/${testApiKey.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Updated Key Name',
                    permissions: ['read:products']
                })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.name).to.equal('Updated Key Name');
            expect(response.body.data.permissions).to.deep.equal(['read:products']);
        });
    });

    describe('POST /api/v1/api-keys/:id/rotate', () => {
        it('should rotate API key', async () => {
            const response = await request(app)
                .post(`/api/v1/api-keys/${testApiKey.id}/rotate`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.have.property('key');
            expect(response.body.data.key).to.not.equal(testApiKey.key);
        });
    });

    describe('DELETE /api/v1/api-keys/:id', () => {
        it('should revoke API key', async () => {
            const response = await request(app)
                .delete(`/api/v1/api-keys/${testApiKey.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;

            // Verify key is revoked
            const keyResult = await query(
                'SELECT status FROM api_keys WHERE id = $1',
                [testApiKey.id]
            );
            expect(keyResult.rows[0].status).to.equal('revoked');
        });
    });
});
