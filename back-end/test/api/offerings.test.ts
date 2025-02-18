import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { createTestUser, generateTestToken, cleanupTestUser } from '../helpers/auth';
import { query } from '../../src/database';

describe('Offerings API', () => {
    let testUser: any;
    let accessToken: string;
    let testApp: any;
    let testProduct: any;
    let testEntitlement: any;
    let testOffering: any;

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

        // Create a test product
        const productResult = await query(
            `INSERT INTO products (name, app_id, type, price, currency)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            ['Premium Product', testApp.id, 'subscription', 9.99, 'USD']
        );
        testProduct = productResult.rows[0];

        // Create a test entitlement
        const entitlementResult = await query(
            `INSERT INTO entitlements (name, app_id, description, features)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            ['Premium Access', testApp.id, 'Premium features', ['feature1']]
        );
        testEntitlement = entitlementResult.rows[0];
    });

    after(async () => {
        if (testUser) {
            await cleanupTestUser(testUser.id);
        }
        if (testApp) {
            await query('DELETE FROM apps WHERE id = $1', [testApp.id]);
        }
        if (testProduct) {
            await query('DELETE FROM products WHERE id = $1', [testProduct.id]);
        }
        if (testEntitlement) {
            await query('DELETE FROM entitlements WHERE id = $1', [testEntitlement.id]);
        }
        if (testOffering) {
            await query('DELETE FROM offerings WHERE id = $1', [testOffering.id]);
        }
    });

    describe('POST /api/v1/offerings', () => {
        it('should create a new offering', async () => {
            const response = await request(app)
                .post('/api/v1/offerings')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Premium Package',
                    appId: testApp.id,
                    description: 'Complete premium package',
                    products: [testProduct.id],
                    entitlements: [testEntitlement.id]
                })
                .expect(201);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.have.property('id');
            expect(response.body.data.name).to.equal('Premium Package');
            expect(response.body.data.products).to.deep.equal([testProduct.id.toString()]);
            expect(response.body.data.entitlements).to.deep.equal([testEntitlement.id.toString()]);

            testOffering = response.body.data;
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/v1/offerings')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Invalid Offering'
                    // Missing required fields
                })
                .expect(400);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('VALIDATION_ERROR');
        });

        it('should validate product and entitlement existence', async () => {
            const response = await request(app)
                .post('/api/v1/offerings')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Invalid Offering',
                    appId: testApp.id,
                    products: ['999999'],
                    entitlements: ['999999']
                })
                .expect(400);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('INVALID_REFERENCE');
        });
    });

    describe('GET /api/v1/offerings', () => {
        it('should list offerings with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/offerings')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.meta).to.have.property('total');
            expect(response.body.meta).to.have.property('page', 1);
            expect(response.body.meta).to.have.property('limit', 10);
        });

        it('should filter offerings by app', async () => {
            const response = await request(app)
                .get('/api/v1/offerings')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ appId: testApp.id })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0].appId).to.equal(testApp.id.toString());
        });
    });

    describe('GET /api/v1/offerings/:id', () => {
        it('should get offering details', async () => {
            const response = await request(app)
                .get(`/api/v1/offerings/${testOffering.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.id).to.equal(testOffering.id);
            expect(response.body.data.name).to.equal(testOffering.name);
            expect(response.body.data.products).to.deep.equal(testOffering.products);
            expect(response.body.data.entitlements).to.deep.equal(testOffering.entitlements);
        });
    });

    describe('PUT /api/v1/offerings/:id', () => {
        it('should update offering details', async () => {
            const response = await request(app)
                .put(`/api/v1/offerings/${testOffering.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Updated Premium Package',
                    description: 'Updated description',
                    products: [testProduct.id],
                    entitlements: [testEntitlement.id]
                })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.name).to.equal('Updated Premium Package');
            expect(response.body.data.description).to.equal('Updated description');
        });

        it('should validate product and entitlement updates', async () => {
            const response = await request(app)
                .put(`/api/v1/offerings/${testOffering.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    products: ['999999'],
                    entitlements: ['999999']
                })
                .expect(400);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('INVALID_REFERENCE');
        });
    });

    describe('DELETE /api/v1/offerings/:id', () => {
        it('should delete an offering', async () => {
            const response = await request(app)
                .delete(`/api/v1/offerings/${testOffering.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;

            // Verify offering is deleted
            const offeringExists = await query(
                'SELECT id FROM offerings WHERE id = $1',
                [testOffering.id]
            );
            expect(offeringExists.rows).to.have.length(0);
        });
    });
});
