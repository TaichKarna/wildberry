import request from 'supertest';
import app from '../../../src/app';
import { verifyJWS } from '../../../src/utils/jwsVerify';
import { processAppleNotification } from '../../../src/modules/webhooks/appleService';

// Mock dependencies
jest.mock('../../../src/utils/jwsVerify');
jest.mock('../../../src/modules/webhooks/appleService');

describe('Apple Webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process valid webhook notification', async () => {
    // Mock the JWS verification
    (verifyJWS as jest.Mock).mockResolvedValue({
      notificationType: 'SUBSCRIBED',
      notificationUUID: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        transactionId: '1000000123456789',
        appAccountToken: 'user123',
        productId: 'com.example.subscription.monthly'
      }
    });
    
    // Mock the notification processing
    (processAppleNotification as jest.Mock).mockResolvedValue(undefined);
    
    // Send a webhook request
    const response = await request(app)
      .post('/api/v1/webhooks/apple')
      .send({
        signedPayload: 'mock.signed.payload'
      });
    
    // Verify response
    expect(response.status).toBe(200);
    
    // Verify JWS verification was called
    expect(verifyJWS).toHaveBeenCalledWith('mock.signed.payload');
    
    // Verify notification processing was called
    expect(processAppleNotification).toHaveBeenCalledWith({
      notificationType: 'SUBSCRIBED',
      notificationUUID: '123e4567-e89b-12d3-a456-426614174000',
      data: {
        transactionId: '1000000123456789',
        appAccountToken: 'user123',
        productId: 'com.example.subscription.monthly'
      }
    });
  });
  
  it('should return 400 for missing signedPayload', async () => {
    const response = await request(app)
      .post('/api/v1/webhooks/apple')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing signedPayload');
    expect(verifyJWS).not.toHaveBeenCalled();
    expect(processAppleNotification).not.toHaveBeenCalled();
  });
  
  it('should handle JWS verification errors gracefully', async () => {
    // Mock JWS verification to throw an error
    (verifyJWS as jest.Mock).mockRejectedValue(new Error('Invalid JWS'));
    
    const response = await request(app)
      .post('/api/v1/webhooks/apple')
      .send({
        signedPayload: 'invalid.payload'
      });
    
    // Should still return 200 to prevent Apple from retrying
    expect(response.status).toBe(200);
    expect(processAppleNotification).not.toHaveBeenCalled();
  });
});
