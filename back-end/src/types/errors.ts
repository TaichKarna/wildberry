import { PURCHASES_ERROR_CODE } from './enums';

export interface ErrorInfo {
    readableErrorCode: string;
}

export interface PurchasesError {
    code: PURCHASES_ERROR_CODE;
    message: string;
    readableErrorCode: string;
    userInfo: ErrorInfo;
    underlyingErrorMessage: string;
    userCancelled: boolean | null;
}
