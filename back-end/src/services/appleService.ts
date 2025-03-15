import axios from 'axios';
import { generateAppleJWT } from '../utils/appleAuth';
import { verifyJWS } from '../utils/jwsVerify';
import { VERIFICATION_RESULT } from 'wildberry-types';
import { CustomerInfo } from '../types/wildberry.types';
import { appleConfig } from '../config';

const APPLE_API_BASE_URL = 'https://api.storekit.itunes.apple.com';
const APPLE_SANDBOX_API_BASE_URL = 'https://api.storekit-sandbox.itunes.apple.com';

// Use sandbox URL in development environment
const apiBaseUrl = process.env.NODE_ENV === 'production' 
  ? APPLE_API_BASE_URL 
  : APPLE_SANDBOX_API_BASE_URL;

/**
 * Get subscription statuses for a transaction ID
 * @param originalTransactionId The original transaction ID
 * @returns Subscription status data
 */
export async function getSubscriptionStatuses(originalTransactionId: string): Promise<any> {
  try {
    const token = generateAppleJWT();
    const response = await axios.get(
      `${apiBaseUrl}/v1/subscriptions/${originalTransactionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Apple returns data in signedPayload format
    if (response.data.signedPayload) {
      return verifyJWS(response.data.signedPayload);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching subscription statuses:', error.response?.data || error.message);
    throw new Error(`Failed to fetch subscription statuses: ${error.message}`);
  }
}

/**
 * Get transaction history for a transaction ID
 * @param originalTransactionId The original transaction ID
 * @returns Transaction history data
 */
export async function getTransactionHistory(originalTransactionId: string): Promise<any> {
  try {
    const token = generateAppleJWT();
    const response = await axios.get(
      `${apiBaseUrl}/v2/history/${originalTransactionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Apple returns data in signedPayload format
    if (response.data.signedPayload) {
      return verifyJWS(response.data.signedPayload);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching transaction history:', error.response?.data || error.message);
    throw new Error(`Failed to fetch transaction history: ${error.message}`);
  }
}

/**
 * Get order lookup details for an order ID
 * @param orderId The order ID
 * @returns Order details
 */
export async function getOrderLookup(orderId: string): Promise<any> {
  try {
    const token = generateAppleJWT();
    const response = await axios.get(
      `${apiBaseUrl}/v1/lookup/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Apple returns data in signedPayload format
    if (response.data.signedPayload) {
      return verifyJWS(response.data.signedPayload);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error looking up order:', error.response?.data || error.message);
    throw new Error(`Failed to look up order: ${error.message}`);
  }
}

/**
 * Maps Apple's subscription and transaction data to our CustomerInfo format
 * @param subscriptionData Subscription data from Apple
 * @param historyData Transaction history data from Apple
 * @returns Mapped CustomerInfo object
 */
export function mapAppleToCustomerInfo(
  subscriptionData: any,
  historyData: any
): CustomerInfo {
  // Extract subscription data
  const subscriptions = subscriptionData?.data || [];
  const transactions = historyData?.signedTransactions || [];
  
  // Map entitlements
  const entitlements = {
    all: subscriptions.reduce((acc: any, sub: any) => {
      acc[sub.productId] = { 
        isActive: sub.status === 'ACTIVE' || sub.status === 'active',
        willRenew: sub.autoRenewStatus === 'ON' || sub.autoRenewStatus === true,
        periodType: sub.offerType || 'NORMAL',
        latestPurchaseDate: sub.purchaseDate,
        originalPurchaseDate: sub.originalPurchaseDate,
        expirationDate: sub.expiresDate,
        productIdentifier: sub.productId,
        isSandbox: process.env.NODE_ENV !== 'production',
        unsubscribeDetectedAt: sub.status === 'EXPIRED' ? new Date().toISOString() : null,
      };
      return acc;
    }, {}),
    active: subscriptions
      .filter((sub: any) => sub.status === 'ACTIVE' || sub.status === 'active')
      .reduce((acc: any, sub: any) => {
        acc[sub.productId] = { 
          isActive: true,
          willRenew: sub.autoRenewStatus === 'ON' || sub.autoRenewStatus === true,
          periodType: sub.offerType || 'NORMAL',
          latestPurchaseDate: sub.purchaseDate,
          originalPurchaseDate: sub.originalPurchaseDate,
          expirationDate: sub.expiresDate,
          productIdentifier: sub.productId,
          isSandbox: process.env.NODE_ENV !== 'production',
        };
        return acc;
      }, {}),
    verification: VERIFICATION_RESULT.VERIFIED, // Using the enum value instead of string literal
  };

  // Get active subscriptions
  const activeSubscriptions = subscriptions
    .filter((sub: any) => sub.status === 'ACTIVE' || sub.status === 'active')
    .map((sub: any) => sub.productId);

  // Get all purchased product identifiers
  const allPurchasedProductIdentifiers = transactions
    .map((tx: any) => tx.productId);

  // Get latest expiration date
  const latestExpirationDate = subscriptions.length > 0 
    ? subscriptions.sort((a: any, b: any) => {
        const dateA = new Date(a.expiresDate || 0).getTime();
        const dateB = new Date(b.expiresDate || 0).getTime();
        return dateB - dateA; // Sort descending
      })[0].expiresDate 
    : null;

  // Map all expiration dates
  const allExpirationDates = subscriptions.reduce((acc: any, sub: any) => {
    acc[sub.productId] = sub.expiresDate || null;
    return acc;
  }, {});

  // Map all purchase dates
  const allPurchaseDates = transactions.reduce((acc: any, tx: any) => {
    acc[tx.productId] = tx.purchaseDate;
    return acc;
  }, {});

  // Extract non-subscription transactions
  const nonSubscriptionTransactions = transactions
    .filter((tx: any) => tx.type !== 'Auto-Renewable Subscription' && tx.type !== 'subscription')
    .map((tx: any) => ({
      transactionIdentifier: tx.transactionId,
      productIdentifier: tx.productId,
      purchaseDate: tx.purchaseDate,
      transactionDate: tx.purchaseDate,
    }));

  return {
    entitlements,
    activeSubscriptions,
    allPurchasedProductIdentifiers,
    latestExpirationDate,
    firstSeen: transactions[0]?.originalPurchaseDate || new Date().toISOString(),
    originalAppUserId: subscriptions[0]?.appAccountToken || '',
    requestDate: new Date().toISOString(),
    allExpirationDates,
    allPurchaseDates,
    originalApplicationVersion: null, // Not available from Apple API directly
    originalPurchaseDate: transactions[0]?.originalPurchaseDate || null,
    managementURL: null, // Not available from Apple API directly
    nonSubscriptionTransactions,
  };
}
