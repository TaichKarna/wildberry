import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app';
import { createTestUser, generateTestToken, cleanupTestUser } from '../helpers/auth';
import { query } from '../../src/database';

describe('Audit Logs API', () => {
    let testUser: any;
    let accessToken: string;
    let testApp: any;
    let testAuditLog: any;

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

        // Create a test audit log
        const logResult = await query(
            `INSERT INTO audit_logs (
                user_id, app_id, action, entity_type, entity_id, details, ip_address
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                testUser.id,
                testApp.id,
                'CREATE',
                'app',
                testApp.id,
                JSON.stringify({ name: 'Test App' }),
                '127.0.0.1'
            ]
        );
        testAuditLog = logResult.rows[0];
    });

    after(async () => {
        if (testUser) {
            await cleanupTestUser(testUser.id);
        }
        if (testApp) {
            await query('DELETE FROM apps WHERE id = $1', [testApp.id]);
        }
    });

    describe('GET /api/v1/audit-logs', () => {
        it('should list audit logs with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/audit-logs')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.meta).to.have.property('total');
            expect(response.body.meta).to.have.property('page', 1);
            expect(response.body.meta).to.have.property('limit', 10);
        });

        it('should filter audit logs by date range', async () => {
            const response = await request(app)
                .get('/api/v1/audit-logs')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({
                    startDate: new Date(Date.now() - 86400000).toISOString(),
                    endDate: new Date().toISOString()
                })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data).to.have.length.greaterThan(0);
        });

        it('should filter audit logs by app ID', async () => {
            const response = await request(app)
                .get('/api/v1/audit-logs')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ appId: testApp.id })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0].appId).to.equal(testApp.id.toString());
        });

        it('should filter audit logs by action type', async () => {
            const response = await request(app)
                .get('/api/v1/audit-logs')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ action: 'CREATE' })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0].action).to.equal('CREATE');
        });
    });

    describe('GET /api/v1/audit-logs/:id', () => {
        it('should get audit log details', async () => {
            const response = await request(app)
                .get(`/api/v1/audit-logs/${testAuditLog.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data.id).to.equal(testAuditLog.id.toString());
            expect(response.body.data.action).to.equal('CREATE');
            expect(response.body.data.entityType).to.equal('app');
        });

        it('should return 404 for non-existent audit log', async () => {
            const response = await request(app)
                .get('/api/v1/audit-logs/999999')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body.success).to.be.false;
            expect(response.body.error.code).to.equal('NOT_FOUND');
        });
    });

    describe('GET /api/v1/audit-logs/summary/actions', () => {
        it('should get action summary', async () => {
            const response = await request(app)
                .get('/api/v1/audit-logs/summary/actions')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({
                    startDate: new Date(Date.now() - 86400000).toISOString(),
                    endDate: new Date().toISOString()
                })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0]).to.have.property('action');
            expect(response.body.data[0]).to.have.property('count');
        });
    });

    describe('GET /api/v1/audit-logs/summary/users', () => {
        it('should get user activity summary', async () => {
            const response = await request(app)
                .get('/api/v1/audit-logs/summary/users')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({
                    startDate: new Date(Date.now() - 86400000).toISOString(),
                    endDate: new Date().toISOString()
                })
                .expect(200);

            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data[0]).to.have.property('username');
            expect(response.body.data[0]).to.have.property('action_count');
            expect(response.body.data[0]).to.have.property('actions');
        });
    });
});
