import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { createTestUser, generateTestToken, cleanupTestUser } from '../helpers/auth';
import { query } from '../../src/database';

describe('Apps API', () => {
    let testUser: any;
    let accessToken: string;
    let testApp: any;

    before(async () => {
        testUser = await createTestUser('admin');
        accessToken = generateTestToken(testUser);
    });

    after(async () => {
        if (testUser) {
            await cleanupTestUser(testUser.id);
        }
        if (testApp) {
            await query('DELETE FROM apps WHERE id = $1', [testApp.id]);
        }
    });

    describe('POST /api/v1/apps', () => {
        it('should create a new app', async () => {
            const response = await request(app)
                .post('/api/v1/apps')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Test App',
                    bundleId: 'com.test.app',
                    platform: 'ios',
                    description: 'Test description'
                })
                .expect(201);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.have.property('id');
            expect(response.body.data.name).to.equal('Test App');
            expect(response.body.data.bundleId).to.equal('com.test.app');
            expect(response.body.data.platform).to.equal('ios');

            testApp = response.body.data;
        });

        it('should reject duplicate bundle ID', async () => {
            const response = await request(app)
                .post('/api/v1/apps')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Another Test App',
                    bundleId: 'com.test.app',
                    platform: 'ios'
                })
                .expect(400);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('DUPLICATE_BUNDLE_ID');
        });
    });

    describe('GET /api/v1/apps', () => {
        it('should list apps with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/apps')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.meta).to.have.property('total');
            expect(response.body.meta).to.have.property('page', 1);
            expect(response.body.meta).to.have.property('limit', 10);
        });

        it('should filter apps by search term', async () => {
            const response = await request(app)
                .get('/api/v1/apps')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ search: 'Test App' })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0].name).to.include('Test App');
        });
    });

    describe('GET /api/v1/apps/:id', () => {
        it('should get app details', async () => {
            const response = await request(app)
                .get(`/api/v1/apps/${testApp.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.id).to.equal(testApp.id);
            expect(response.body.data.name).to.equal(testApp.name);
        });

        it('should return 404 for non-existent app', async () => {
            const response = await request(app)
                .get('/api/v1/apps/999999')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('NOT_FOUND');
        });
    });

    describe('PUT /api/v1/apps/:id', () => {
        it('should update app details', async () => {
            const response = await request(app)
                .put(`/api/v1/apps/${testApp.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Updated Test App',
                    description: 'Updated description'
                })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.name).to.equal('Updated Test App');
            expect(response.body.data.description).to.equal('Updated description');
        });
    });

    describe('DELETE /api/v1/apps/:id', () => {
        it('should delete an app', async () => {
            const response = await request(app)
                .delete(`/api/v1/apps/${testApp.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;

            // Verify app is deleted
            const appExists = await query(
                'SELECT id FROM apps WHERE id = $1',
                [testApp.id]
            );
            expect(appExists.rows).to.have.length(0);
        });
    });
});
