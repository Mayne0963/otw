/**
 * Handle Stripe webhook events
 */
export declare const stripeWebhook: import("firebase-functions/v2/https").HttpsFunction;
/**
 * Generic payment webhook handler
 */
export declare const paymentWebhook: import("firebase-functions/v2/https").HttpsFunction;
export declare const webhookHandlers: {
    stripeWebhook: import("firebase-functions/v2/https").HttpsFunction;
    paymentWebhook: import("firebase-functions/v2/https").HttpsFunction;
};
//# sourceMappingURL=stripeWebhooks.d.ts.map