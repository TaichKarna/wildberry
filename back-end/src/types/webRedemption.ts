import { CustomerInfo } from './customerInfo';
import { PurchasesError } from './errors';

export enum WebPurchaseRedemptionResultType {
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
    PURCHASE_BELONGS_TO_OTHER_USER = "PURCHASE_BELONGS_TO_OTHER_USER",
    INVALID_TOKEN = "INVALID_TOKEN",
    EXPIRED = "EXPIRED"
}

export interface WebPurchaseRedemption {
    redemptionLink: string;
}

export type WebPurchaseRedemptionResult = {
    result: WebPurchaseRedemptionResultType.SUCCESS;
    customerInfo: CustomerInfo;
} | {
    result: WebPurchaseRedemptionResultType.ERROR;
    error: PurchasesError;
} | {
    result: WebPurchaseRedemptionResultType.PURCHASE_BELONGS_TO_OTHER_USER;
} | {
    result: WebPurchaseRedemptionResultType.INVALID_TOKEN;
} | {
    result: WebPurchaseRedemptionResultType.EXPIRED;
    obfuscatedEmail: string;
};
