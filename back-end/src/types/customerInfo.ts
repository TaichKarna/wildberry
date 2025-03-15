import { VERIFICATION_RESULT } from 'wildberry-types';

// Re-export the types from wildberry-types
export { VERIFICATION_RESULT };

// Keep the local interface definitions for compatibility
export interface PurchasesEntitlementInfo {
    identifier: string;
    isActive: boolean;
    willRenew: boolean;
    periodType: string;
    latestPurchaseDate: string;
    latestPurchaseDateMillis: number;
    originalPurchaseDate: string;
    originalPurchaseDateMillis: number;
    expirationDate: string | null;
    expirationDateMillis: number | null;
    store: "PLAY_STORE" | "APP_STORE" | "STRIPE" | "MAC_APP_STORE" | "PROMOTIONAL" | "AMAZON" | "RC_BILLING" | "EXTERNAL" | "UNKNOWN_STORE";
    productIdentifier: string;
    productPlanIdentifier: string | null;
    isSandbox: boolean;
    unsubscribeDetectedAt: string | null;
    unsubscribeDetectedAtMillis: number | null;
    billingIssueDetectedAt: string | null;
    billingIssueDetectedAtMillis: number | null;
    ownershipType: "FAMILY_SHARED" | "PURCHASED" | "UNKNOWN";
    verification: VERIFICATION_RESULT;
}

export interface PurchasesEntitlementInfos {
    all: {
        [key: string]: PurchasesEntitlementInfo;
    };
    active: {
        [key: string]: PurchasesEntitlementInfo;
    };
    verification: VERIFICATION_RESULT;
}

export interface PurchasesStoreTransaction {
    transactionIdentifier: string;
    productIdentifier: string;
    purchaseDate: string;
}

export interface CustomerInfo {
    entitlements: PurchasesEntitlementInfos;
    activeSubscriptions: string[];
    allPurchasedProductIdentifiers: string[];
    latestExpirationDate: string | null;
    firstSeen: string;
    originalAppUserId: string;
    requestDate: string;
    allExpirationDates: {
        [key: string]: string | null;
    };
    allPurchaseDates: {
        [key: string]: string | null;
    };
    originalApplicationVersion: string | null;
    originalPurchaseDate: string | null;
    managementURL: string | null;
    nonSubscriptionTransactions: PurchasesStoreTransaction[];
}
