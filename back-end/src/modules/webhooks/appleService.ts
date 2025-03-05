import { updateCustomer, getCustomer } from '../../database/models/customer';
import { getSubscriptionStatuses, getTransactionHistory, mapAppleToCustomerInfo } from '../../services/appleService';
import Logger from '../../utils/Logger';

/**
 * Process Apple App Store Server notification
 * @param notification The notification payload from Apple
 */
export async function processAppleNotification(notification: any): Promise<void> {
  try {
    const { notificationType, data, notificationUUID } = notification;
    
    Logger.info(`Processing Apple notification: ${notificationType}, UUID: ${notificationUUID}`);
    
    // Extract transaction and app user IDs
    const transactionId = data.transactionId || data.originalTransactionId;
    const appUserId = data.appAccountToken; // This is how Apple identifies the user
    
    if (!appUserId || !transactionId) {
      Logger.error('Missing appUserId or transactionId in notification', { notification });
      return;
    }
    
    // Get customer from database
    const customer = await getCustomer(appUserId);
    if (!customer) {
      Logger.error(`Customer not found for appUserId: ${appUserId}`);
      return;
    }
    
    // Fetch latest subscription data
    const subscriptionData = await getSubscriptionStatuses(transactionId);
    const historyData = await getTransactionHistory(transactionId);
    const customerInfo = mapAppleToCustomerInfo(subscriptionData, { signedTransactions: [data] });
    
    // Process based on notification type
    switch (notificationType) {
      case 'SUBSCRIBED':
      case 'DID_RENEW':
        // New subscription or successful renewal
        await updateCustomer(appUserId, customerInfo);
        Logger.info(`Updated customer ${appUserId} for ${notificationType}`);
        break;
        
      case 'DID_CHANGE_RENEWAL_STATUS':
        // User turned auto-renewal on/off
        await updateCustomer(appUserId, {
          ...customerInfo,
          entitlements: {
            ...customerInfo.entitlements,
            all: {
              ...customerInfo.entitlements.all,
              [data.productId]: {
                ...(customerInfo.entitlements.all[data.productId] as any || {}),
                willRenew: data.autoRenewStatus === 'ON' || data.autoRenewStatus === true,
              }
            }
          }
        });
        Logger.info(`Updated renewal status for customer ${appUserId}, product: ${data.productId}`);
        break;
        
      case 'EXPIRED':
        // Subscription expired
        await updateCustomer(appUserId, {
          ...customerInfo,
          activeSubscriptions: customerInfo.activeSubscriptions.filter(
            (sub) => sub !== data.productId
          ),
          entitlements: {
            ...customerInfo.entitlements,
            active: Object.keys(customerInfo.entitlements.active)
              .filter(key => key !== data.productId)
              .reduce((obj: any, key) => {
                obj[key] = customerInfo.entitlements.active[key];
                return obj;
              }, {}),
            all: {
              ...customerInfo.entitlements.all,
              [data.productId]: {
                ...(customerInfo.entitlements.all[data.productId] as any || {}),
                isActive: false,
                willRenew: false,
                unsubscribeDetectedAt: new Date().toISOString(),
              }
            }
          }
        });
        Logger.info(`Marked subscription as expired for customer ${appUserId}, product: ${data.productId}`);
        break;
        
      case 'DID_FAIL_TO_RENEW':
        // Renewal failed (e.g., payment issue)
        await updateCustomer(appUserId, {
          ...customerInfo,
          entitlements: {
            ...customerInfo.entitlements,
            all: {
              ...customerInfo.entitlements.all,
              [data.productId]: {
                ...(customerInfo.entitlements.all[data.productId] as any || {}),
                isActive: false,
                willRenew: true, // Still trying to renew
              }
            }
          }
        });
        Logger.info(`Renewal failed for customer ${appUserId}, product: ${data.productId}`);
        break;
        
      case 'REFUND':
        // Refund issued
        await updateCustomer(appUserId, {
          ...customerInfo,
          activeSubscriptions: customerInfo.activeSubscriptions.filter(
            (sub) => sub !== data.productId
          ),
          entitlements: {
            ...customerInfo.entitlements,
            active: Object.keys(customerInfo.entitlements.active)
              .filter(key => key !== data.productId)
              .reduce((obj: any, key) => {
                obj[key] = customerInfo.entitlements.active[key];
                return obj;
              }, {}),
            all: {
              ...customerInfo.entitlements.all,
              [data.productId]: {
                ...(customerInfo.entitlements.all[data.productId] as any || {}),
                isActive: false,
                willRenew: false,
              }
            }
          }
        });
        Logger.info(`Processed refund for customer ${appUserId}, product: ${data.productId}`);
        break;
        
      default:
        Logger.info(`Unhandled notification type: ${notificationType}`);
    }
  } catch (error: any) {
    Logger.error('Error processing Apple notification:', error);
  }
}
