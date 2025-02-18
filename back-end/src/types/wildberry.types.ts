export interface CustomerInfo {
    entitlements: {
        all: Record<string, unknown>;
        active: Record<string, unknown>;
        verification: string;
    };
    activeSubscriptions: string[];
    allPurchasedProductIdentifiers: string[];
    latestExpirationDate: string | null;
    firstSeen: string;
    originalAppUserId: string;
    requestDate: string;
    allExpirationDates: Record<string, string>;
    allPurchaseDates: Record<string, string>;
    originalApplicationVersion: string | null;
    originalPurchaseDate: string | null;
    managementURL: string | null;
    nonSubscriptionTransactions: any[];
}

export interface PurchasesOfferings {
    all: Record<string, unknown>;
    current: unknown | null;
}

export interface Transaction {
    transactionIdentifier: string;
    productIdentifier: string;
    purchaseDate: string;
}

export interface MakePurchaseResult {
    productIdentifier: string;
    customerInfo: CustomerInfo;
    transaction: Transaction;
}

export interface LogInResult {
    customerInfo: CustomerInfo;
    created: boolean;
}

export interface WebPurchaseRedemptionResult {
    result: "SUCCESS" | "ERROR";
    customerInfo?: CustomerInfo;
    error?: PurchasesError;
}

export interface PurchasesError {
    code: PURCHASES_ERROR_CODE;
    message: string;
    readableErrorCode: string;
    userInfo: {
        readableErrorCode: string;
    };
    underlyingErrorMessage: string;
    userCancelled: boolean;
}

export enum PURCHASES_ERROR_CODE {
    UNKNOWN_ERROR = 0,
    PURCHASE_CANCELLED_ERROR = 1,
    PURCHASE_INVALID_ERROR = 2,
    INVALID_APP_USER_ID_ERROR = 3
}
