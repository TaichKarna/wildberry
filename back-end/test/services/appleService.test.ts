import { mapAppleToCustomerInfo } from '../../src/services/appleService';

// Mock data for testing
const mockSubscriptionData = {
  data: [
    {
      status: 'ACTIVE',
      productId: 'com.example.subscription.monthly',
      expiresDate: '2025-03-05T12:00:00Z',
      purchaseDate: '2025-02-05T12:00:00Z',
      originalPurchaseDate: '2025-02-05T12:00:00Z',
      autoRenewStatus: 'ON',
      appAccountToken: 'user123'
    }
  ]
};

const mockHistoryData = {
  signedTransactions: [
    {
      transactionId: '1000000123456789',
      productId: 'com.example.subscription.monthly',
      purchaseDate: '2025-02-05T12:00:00Z',
      originalPurchaseDate: '2025-02-05T12:00:00Z',
      type: 'Auto-Renewable Subscription'
    },
    {
      transactionId: '1000000123456790',
      productId: 'com.example.non.subscription.product',
      purchaseDate: '2025-01-05T12:00:00Z',
      originalPurchaseDate: '2025-01-05T12:00:00Z',
      type: 'Non-Consumable'
    }
  ]
};

describe('Apple Service', () => {
  describe('mapAppleToCustomerInfo', () => {
    it('should map Apple subscription data to CustomerInfo format', () => {
      const result = mapAppleToCustomerInfo(mockSubscriptionData, mockHistoryData);
      
      // Check basic structure
      expect(result).toHaveProperty('entitlements');
      expect(result).toHaveProperty('activeSubscriptions');
      expect(result).toHaveProperty('allPurchasedProductIdentifiers');
      
      // Check entitlements
      expect(result.entitlements.all).toHaveProperty('com.example.subscription.monthly');
      expect(result.entitlements.active).toHaveProperty('com.example.subscription.monthly');
      expect(result.entitlements.verification).toBe('VERIFIED');
      
      // Check active subscriptions
      expect(result.activeSubscriptions).toContain('com.example.subscription.monthly');
      
      // Check all purchased products
      expect(result.allPurchasedProductIdentifiers).toContain('com.example.subscription.monthly');
      expect(result.allPurchasedProductIdentifiers).toContain('com.example.non.subscription.product');
      
      // Check dates
      expect(result.latestExpirationDate).toBe('2025-03-05T12:00:00Z');
      expect(result.originalPurchaseDate).toBe('2025-02-05T12:00:00Z');
      
      // Check non-subscription transactions
      expect(result.nonSubscriptionTransactions).toHaveLength(1);
      expect(result.nonSubscriptionTransactions[0].productIdentifier).toBe('com.example.non.subscription.product');
    });
    
    it('should handle empty subscription data', () => {
      const result = mapAppleToCustomerInfo({ data: [] }, { signedTransactions: [] });
      
      expect(result.entitlements.all).toEqual({});
      expect(result.entitlements.active).toEqual({});
      expect(result.activeSubscriptions).toEqual([]);
      expect(result.allPurchasedProductIdentifiers).toEqual([]);
      expect(result.latestExpirationDate).toBeNull();
    });
  });
});
