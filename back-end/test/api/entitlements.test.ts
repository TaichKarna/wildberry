import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { createTestUser, generateTestToken, cleanupTestUser } from '../helpers/auth';
import { query } from '../../src/database';

describe('Entitlements API', () => {
    let testUser: any;
    let accessToken: string;
    let testApp: any;
    let testEntitlement: any;

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
        if (testEntitlement) {
            await query('DELETE FROM entitlements WHERE id = $1', [testEntitlement.id]);
        }
    });

    describe('POST /api/v1/entitlements', () => {
        it('should create a new entitlement', async () => {
            const response = await request(app)
                .post('/api/v1/entitlements')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Premium Access',
                    appId: testApp.id,
                    description: 'Access to premium features',
                    features: ['feature1', 'feature2']
                })
                .expect(201);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.have.property('id');
            expect(response.body.data.name).to.equal('Premium Access');
            expect(response.body.data.features).to.deep.equal(['feature1', 'feature2']);

            testEntitlement = response.body.data;
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/v1/entitlements')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Invalid Entitlement'
                    // Missing required fields
                })
                .expect(400);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('VALIDATION_ERROR');
        });
    });

    describe('GET /api/v1/entitlements', () => {
        it('should list entitlements with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/entitlements')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.meta).to.have.property('total');
            expect(response.body.meta).to.have.property('page', 1);
            expect(response.body.meta).to.have.property('limit', 10);
        });

        it('should filter entitlements by app', async () => {
            const response = await request(app)
                .get('/api/v1/entitlements')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ appId: testApp.id })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0].appId).to.equal(testApp.id.toString());
        });

        it('should search entitlements by name', async () => {
            const response = await request(app)
                .get('/api/v1/entitlements')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ search: 'Premium' })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0].name).to.include('Premium');
        });
    });

    describe('GET /api/v1/entitlements/:id', () => {
        it('should get entitlement details', async () => {
            const response = await request(app)
                .get(`/api/v1/entitlements/${testEntitlement.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.id).to.equal(testEntitlement.id);
            expect(response.body.data.name).to.equal(testEntitlement.name);
            expect(response.body.data.features).to.deep.equal(testEntitlement.features);
        });

        it('should return 404 for non-existent entitlement', async () => {
            const response = await request(app)
                .get('/api/v1/entitlements/999999')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('NOT_FOUND');
        });
    });

    describe('PUT /api/v1/entitlements/:id', () => {
        it('should update entitlement details', async () => {
            const response = await request(app)
                .put(`/api/v1/entitlements/${testEntitlement.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Updated Premium Access',
                    description: 'Updated description',
                    features: ['feature1', 'feature2', 'feature3']
                })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.name).to.equal('Updated Premium Access');
            expect(response.body.data.description).to.equal('Updated description');
            expect(response.body.data.features).to.deep.equal(['feature1', 'feature2', 'feature3']);
        });
    });

    describe('DELETE /api/v1/entitlements/:id', () => {
        it('should delete an entitlement', async () => {
            const response = await request(app)
                .delete(`/api/v1/entitlements/${testEntitlement.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;

            // Verify entitlement is deleted
            const entitlementExists = await query(
                'SELECT id FROM entitlements WHERE id = $1',
                [testEntitlement.id]
            );
            expect(entitlementExists.rows).to.have.length(0);
        });
    });
});
