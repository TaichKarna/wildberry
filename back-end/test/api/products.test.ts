import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { createTestUser, generateTestToken, cleanupTestUser } from '../helpers/auth';
import { query } from '../../src/database';

describe('Products API', () => {
    let testUser: any;
    let accessToken: string;
    let testApp: any;
    let testProduct: any;

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
        if (testProduct) {
            await query('DELETE FROM products WHERE id = $1', [testProduct.id]);
        }
    });

    describe('POST /api/v1/products', () => {
        it('should create a new product', async () => {
            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Premium Subscription',
                    appId: testApp.id,
                    type: 'subscription',
                    price: 9.99,
                    currency: 'USD',
                    interval: 'month',
                    description: 'Monthly premium subscription'
                })
                .expect(201);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.have.property('id');
            expect(response.body.data.name).to.equal('Premium Subscription');
            expect(response.body.data.price).to.equal(9.99);
            expect(response.body.data.type).to.equal('subscription');

            testProduct = response.body.data;
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Invalid Product'
                    // Missing required fields
                })
                .expect(400);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('VALIDATION_ERROR');
        });
    });

    describe('GET /api/v1/products', () => {
        it('should list products with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.meta).to.have.property('total');
            expect(response.body.meta).to.have.property('page', 1);
            expect(response.body.meta).to.have.property('limit', 10);
        });

        it('should filter products by app', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ appId: testApp.id })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0].appId).to.equal(testApp.id.toString());
        });

        it('should filter products by type', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ type: 'subscription' })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0].type).to.equal('subscription');
        });
    });

    describe('GET /api/v1/products/:id', () => {
        it('should get product details', async () => {
            const response = await request(app)
                .get(`/api/v1/products/${testProduct.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.id).to.equal(testProduct.id);
            expect(response.body.data.name).to.equal(testProduct.name);
            expect(response.body.data.price).to.equal(testProduct.price);
        });

        it('should return 404 for non-existent product', async () => {
            const response = await request(app)
                .get('/api/v1/products/999999')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('NOT_FOUND');
        });
    });

    describe('PUT /api/v1/products/:id', () => {
        it('should update product details', async () => {
            const response = await request(app)
                .put(`/api/v1/products/${testProduct.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Updated Premium Subscription',
                    price: 19.99,
                    description: 'Updated description'
                })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.name).to.equal('Updated Premium Subscription');
            expect(response.body.data.price).to.equal(19.99);
            expect(response.body.data.description).to.equal('Updated description');
        });

        it('should validate price changes', async () => {
            const response = await request(app)
                .put(`/api/v1/products/${testProduct.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    price: -10
                })
                .expect(400);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('VALIDATION_ERROR');
        });
    });

    describe('DELETE /api/v1/products/:id', () => {
        it('should delete a product', async () => {
            const response = await request(app)
                .delete(`/api/v1/products/${testProduct.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;

            // Verify product is deleted
            const productExists = await query(
                'SELECT id FROM products WHERE id = $1',
                [testProduct.id]
            );
            expect(productExists.rows).to.have.length(0);
        });
    });
});
