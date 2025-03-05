import { Router } from 'express';
import { createCustomer, getCustomer, updateCustomer } from '../database/models/customer';
import {
    PURCHASES_ERROR_CODE,
    CustomerInfo,
    PurchasesOfferings,
    MakePurchaseResult,
    LogInResult,
    WebPurchaseRedemptionResult,
    WebPurchaseRedemptionResultType,
    PurchasesError
} from '../types';
import { getSubscriptionStatuses, getTransactionHistory, getOrderLookup, mapAppleToCustomerInfo } from '../services/appleService';

import express from "express";
import appsRoutes from './apps/routes';
import productsRoutes from './products/routes';
import entitlementsRoutes from './entitlements/routes';
import offeringsRoutes from './offerings/routes';
import apiKeysRoutes from './api-keys/routes';
import analyticsRoutes from './analytics/routes';
import auditLogsRoutes from './audit-logs/routes';
import Logger from '../utils/Logger';

const router = express.Router();

// Helper function to create error responses
function createErrorResponse(
    code: PURCHASES_ERROR_CODE,
    message: string,
    readableErrorCode: string = "UNKNOWN_ERROR",
    underlyingErrorMessage: string = ""
): PurchasesError {
    return {
        code,
        message,
        readableErrorCode,
        userInfo: { readableErrorCode },
        underlyingErrorMessage,
        userCancelled: code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
    };
}

// Get Customer Info
router.get("/customer/:app_user_id", async (req, res) => {
    try {
        const appUserId = req.params.app_user_id;
        const customer = await getCustomer(appUserId);
        
        if (!customer) {
            return res.status(404).json(
                createErrorResponse(PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR, "Customer not found")
            );
        }
        
        // Get the original transaction ID from customer record
        // If not available, we'll just return the existing customer info
        const originalTransactionId = customer.allPurchasedProductIdentifiers[0];
        
        if (originalTransactionId) {
            try {
                // Fetch latest data from Apple
                const subscriptionData = await getSubscriptionStatuses(originalTransactionId);
                const historyData = await getTransactionHistory(originalTransactionId);
                
                // Map Apple data to our CustomerInfo format
                const updatedCustomerInfo = mapAppleToCustomerInfo(subscriptionData, historyData);
                
                // Update customer in database
                await updateCustomer(appUserId, updatedCustomerInfo);
                
                // Return updated customer info
                return res.json(updatedCustomerInfo);
            } catch (appleError) {
                Logger.error('Error fetching data from Apple API:', appleError);
                // If Apple API fails, return existing customer info
            }
        }
        
        // Return existing customer info if no transaction ID or Apple API fails
        res.json(customer);
    } catch (error: any) {
        console.error("Error fetching customer info:", error);
        res.status(500).json(
            createErrorResponse(PURCHASES_ERROR_CODE.UNKNOWN_ERROR, "Failed to fetch customer info")
        );
    }
});

// Get Offerings
router.get("/offerings", async (req, res) => {
    try {
        // TODO: Implement RevenueCat API integration
        const offerings: PurchasesOfferings = {
            all: {},
            current: null
        };
        res.json(offerings);
    } catch (error: any) {
        console.error("Error fetching offerings:", error);
        res.status(500).json(
            createErrorResponse(PURCHASES_ERROR_CODE.UNKNOWN_ERROR, "Failed to fetch offerings")
        );
    }
});

// Make Purchase
router.post("/purchase", async (req, res) => {
    try {
        const {
            app_user_id,
            product_id,
            transaction_id, // Added for Apple integration
            type,
            old_sku,
            proration_mode,
            is_restore,
            offering_identifier,
        } = req.body;

        if (!app_user_id) {
            return res.status(400).json(
                createErrorResponse(PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR, "Missing app_user_id")
            );
        }

        if (!product_id && !transaction_id) {
            return res.status(400).json(
                createErrorResponse(PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR, "Missing product_id or transaction_id")
            );
        }

        // Get or create customer
        let customerInfo = await getCustomer(app_user_id);
        if (!customerInfo) {
            customerInfo = await createCustomer(app_user_id);
        }

        // If transaction_id is provided, fetch data from Apple
        if (transaction_id) {
            try {
                const subscriptionData = await getSubscriptionStatuses(transaction_id);
                const historyData = await getTransactionHistory(transaction_id);
                
                // Map Apple data to our CustomerInfo format
                const updatedCustomerInfo = mapAppleToCustomerInfo(subscriptionData, historyData);
                
                // Update customer in database
                await updateCustomer(app_user_id, updatedCustomerInfo);
                
                // Create purchase result
                const purchaseResult: MakePurchaseResult = {
                    productIdentifier: subscriptionData?.data?.[0]?.productId || product_id,
                    customerInfo: updatedCustomerInfo,
                    transaction: {
                        transactionIdentifier: transaction_id,
                        productIdentifier: subscriptionData?.data?.[0]?.productId || product_id,
                        purchaseDate: subscriptionData?.data?.[0]?.purchaseDate || new Date().toISOString()
                    }
                };
                
                return res.json(purchaseResult);
            } catch (appleError) {
                Logger.error('Error processing purchase with Apple API:', appleError);
                // Fall back to default behavior if Apple API fails
            }
        }

        // Default behavior if no transaction_id or Apple API fails
        const purchaseResult: MakePurchaseResult = {
            productIdentifier: product_id,
            customerInfo,
            transaction: {
                transactionIdentifier: transaction_id || "transaction_id_" + Date.now(),
                productIdentifier: product_id,
                purchaseDate: new Date().toISOString()
            }
        };
        res.json(purchaseResult);
    } catch (error: any) {
        console.error("Error processing purchase:", error);
        res.status(500).json(
            createErrorResponse(PURCHASES_ERROR_CODE.UNKNOWN_ERROR, "Failed to process purchase")
        );
    }
});

// Order Lookup
router.get("/order/:order_id", async (req, res) => {
    try {
        const orderId = req.params.order_id;
        
        if (!orderId) {
            return res.status(400).json(
                createErrorResponse(PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR, "Missing order_id")
            );
        }
        
        // Fetch order details from Apple
        const orderData = await getOrderLookup(orderId);
        
        res.json(orderData);
    } catch (error: any) {
        console.error("Error looking up order:", error);
        res.status(500).json(
            createErrorResponse(PURCHASES_ERROR_CODE.UNKNOWN_ERROR, "Failed to look up order")
        );
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { app_user_id } = req.body;

        if (!app_user_id) {
            return res.status(400).json(
                createErrorResponse(PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR, "Missing app_user_id")
            );
        }

        let customerInfo = await getCustomer(app_user_id);
        let created = false;

        if (!customerInfo) {
            customerInfo = await createCustomer(app_user_id);
            created = true;
        }

        const loginResult: LogInResult = {
            customerInfo,
            created
        };
        res.json(loginResult);
    } catch (error: any) {
        console.error("Error logging in:", error);
        res.status(500).json(
            createErrorResponse(PURCHASES_ERROR_CODE.UNKNOWN_ERROR, "Failed to log in")
        );
    }
});

// Logout
router.post("/logout", async (req, res) => {
    try {
        const { app_user_id } = req.body;
        if (!app_user_id) {
            return res.status(400).json(
                createErrorResponse(PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR, "Missing app_user_id")
            );
        }

        // Generate new anonymous ID
        const newAnonymousId = "anonymous_" + Date.now();
        const customerInfo = await createCustomer(newAnonymousId);
        res.json(customerInfo);
    } catch (error: any) {
        console.error("Error logging out:", error);
        res.status(500).json(
            createErrorResponse(PURCHASES_ERROR_CODE.UNKNOWN_ERROR, "Failed to log out")
        );
    }
});

// Redeem
router.post("/redeem", async (req, res) => {
    try {
        const { redemptionLink, app_user_id } = req.body;
        if (!redemptionLink || !app_user_id) {
            return res.status(400).json({
                result: "ERROR",
                error: createErrorResponse(
                    PURCHASES_ERROR_CODE.UNKNOWN_ERROR,
                    "Missing redemptionLink or app_user_id"
                )
            });
        }

        // TODO: Implement Apple redemption API integration
        const customerInfo = await getCustomer(app_user_id);
        if (!customerInfo) {
            return res.status(404).json({
                result: "ERROR",
                error: createErrorResponse(
                    PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR,
                    "Customer not found"
                )
            });
        }

        const result: WebPurchaseRedemptionResult = {
            result: WebPurchaseRedemptionResultType.SUCCESS,
            customerInfo
        };
        res.json(result);
    } catch (error: any) {
        console.error("Error redeeming:", error);
        res.status(500).json({
            result: "ERROR",
            error: createErrorResponse(PURCHASES_ERROR_CODE.UNKNOWN_ERROR, "Failed to redeem")
        });
    }
});

router.use('/apps', appsRoutes);
router.use('/products', productsRoutes);
router.use('/entitlements', entitlementsRoutes);
router.use('/offerings', offeringsRoutes);
router.use('/api-keys', apiKeysRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit-logs', auditLogsRoutes);

export default router;
