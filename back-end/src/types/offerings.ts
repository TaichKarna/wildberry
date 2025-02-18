import { PACKAGE_TYPE, PRODUCT_CATEGORY, PRODUCT_TYPE } from './enums';

export interface PurchasesStoreProduct {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    pricePerWeek: number;
    pricePerMonth: number;
    pricePerYear: number;
    pricePerWeekString: string;
    pricePerMonthString: string;
    pricePerYearString: string;
    currencyCode: string;
    introPrice: PurchasesIntroPrice | null;
    discounts: PurchasesStoreProductDiscount[] | null;
    productCategory: PRODUCT_CATEGORY | null;
    productType: PRODUCT_TYPE;
    subscriptionPeriod: string | null;
    presentedOfferingIdentifier: string | null;
}

export interface PurchasesStoreProductDiscount {
    identifier: string;
    price: number;
    priceString: string;
    cycles: number;
    period: string;
    periodUnit: string;
    periodNumberOfUnits: number;
}

export interface PurchasesIntroPrice {
    price: number;
    priceString: string;
    cycles: number;
    period: string;
    periodUnit: string;
    periodNumberOfUnits: number;
}

export interface PurchasesPackage {
    identifier: string;
    packageType: PACKAGE_TYPE;
    product: PurchasesStoreProduct;
    offeringIdentifier: string;
}

export interface PurchasesOffering {
    identifier: string;
    serverDescription: string;
    metadata: {
        [key: string]: unknown;
    };
    availablePackages: PurchasesPackage[];
    lifetime: PurchasesPackage | null;
    annual: PurchasesPackage | null;
    sixMonth: PurchasesPackage | null;
    threeMonth: PurchasesPackage | null;
    twoMonth: PurchasesPackage | null;
    monthly: PurchasesPackage | null;
    weekly: PurchasesPackage | null;
}

export interface PurchasesOfferings {
    all: {
        [key: string]: PurchasesOffering;
    };
    current: PurchasesOffering | null;
}
