export * from './enums';
export * from './customerInfo';
export * from './offerings';
export * from './errors';
export * from './webRedemption';

export interface LogInResult {
    customerInfo: import('./customerInfo').CustomerInfo;
    created: boolean;
}

export interface MakePurchaseResult {
    productIdentifier: string;
    customerInfo: import('./customerInfo').CustomerInfo;
    transaction: import('./customerInfo').PurchasesStoreTransaction;
}
