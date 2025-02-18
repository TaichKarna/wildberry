describe('getUser', () => {
  it('shold return 1', () => {});
});

import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import { createCustomer, getCustomer } from '../src/database/models/customer';
import { CustomerInfo, PurchasesOfferings, MakePurchaseResult, LogInResult, WebPurchaseRedemptionResult } from '../src/types';
import { PURCHASES_ERROR_CODE } from '../src/types/enums';

describe('RevenueCat API Integration Tests', () => {
    const testUserId = 'test_user_' + Date.now();
    let testCustomerInfo: CustomerInfo;

    before(async () => {
        // Create a test customer
        testCustomerInfo = await createCustomer(testUserId);
    });

    describe('GET /customer/:app_user_id', () => {
        it('should return customer info for valid user ID', async () => {
            const response = await request(app)
                .get(`/customer/${testUserId}`)
                .expect(200);

            expect(response.body).to.have.property('originalAppUserId', testUserId);
            expect(response.body).to.have.property('entitlements');
            expect(response.body.entitlements).to.have.property('all');
            expect(response.body.entitlements).to.have.property('active');
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/customer/nonexistent_user')
                .expect(404);

            expect(response.body).to.have.property('code', PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR);
        });
    });

    describe('GET /offerings', () => {
        it('should return offerings object', async () => {
            const response = await request(app)
                .get('/offerings')
                .expect(200);

            expect(response.body).to.have.property('all');
            expect(response.body).to.have.property('current');
        });
    });

    describe('POST /purchase', () => {
        it('should process purchase for valid input', async () => {
            const purchaseData = {
                app_user_id: testUserId,
                product_id: 'test_product',
                type: 'subs'
            };

            const response = await request(app)
                .post('/purchase')
                .send(purchaseData)
                .expect(200);

            expect(response.body).to.have.property('productIdentifier', purchaseData.product_id);
            expect(response.body).to.have.property('customerInfo');
            expect(response.body).to.have.property('transaction');
            expect(response.body.transaction).to.have.property('transactionIdentifier');
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/purchase')
                .send({})
                .expect(400);

            expect(response.body).to.have.property('code', PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR);
        });
    });

    describe('POST /login', () => {
        it('should create new customer on first login', async () => {
            const newUserId = 'new_user_' + Date.now();
            const response = await request(app)
                .post('/login')
                .send({ app_user_id: newUserId })
                .expect(200);

            expect(response.body).to.have.property('created', true);
            expect(response.body).to.have.property('customerInfo');
            expect(response.body.customerInfo).to.have.property('originalAppUserId', newUserId);
        });

        it('should return existing customer on subsequent login', async () => {
            const response = await request(app)
                .post('/login')
                .send({ app_user_id: testUserId })
                .expect(200);

            expect(response.body).to.have.property('created', false);
            expect(response.body).to.have.property('customerInfo');
            expect(response.body.customerInfo).to.have.property('originalAppUserId', testUserId);
        });

        it('should return 400 for missing app_user_id', async () => {
            const response = await request(app)
                .post('/login')
                .send({})
                .expect(400);

            expect(response.body).to.have.property('code', PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR);
        });
    });

    describe('POST /logout', () => {
        it('should create new anonymous user on logout', async () => {
            const response = await request(app)
                .post('/logout')
                .send({ app_user_id: testUserId })
                .expect(200);

            expect(response.body).to.have.property('originalAppUserId');
            expect(response.body.originalAppUserId).to.include('anonymous_');
        });

        it('should return 400 for missing app_user_id', async () => {
            const response = await request(app)
                .post('/logout')
                .send({})
                .expect(400);

            expect(response.body).to.have.property('code', PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR);
        });
    });

    describe('POST /redeem', () => {
        it('should process valid redemption', async () => {
            const redemptionData = {
                redemptionLink: 'http://localhost:3000/redeem/test-token',
                app_user_id: testUserId
            };

            const response = await request(app)
                .post('/redeem')
                .send(redemptionData)
                .expect(200);

            expect(response.body).to.have.property('result', 'SUCCESS');
            expect(response.body).to.have.property('customerInfo');
        });

        it('should return 400 for missing redemption link', async () => {
            const response = await request(app)
                .post('/redeem')
                .send({ app_user_id: testUserId })
                .expect(400);

            expect(response.body).to.have.property('result', 'ERROR');
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.have.property('code', PURCHASES_ERROR_CODE.UNKNOWN_ERROR);
        });

        it('should return 404 for non-existent user', async () => {
            const redemptionData = {
                redemptionLink: 'http://localhost:3000/redeem/test-token',
                app_user_id: 'nonexistent_user'
            };

            const response = await request(app)
                .post('/redeem')
                .send(redemptionData)
                .expect(404);

            expect(response.body).to.have.property('result', 'ERROR');
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.have.property('code', PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR);
        });
    });
});
