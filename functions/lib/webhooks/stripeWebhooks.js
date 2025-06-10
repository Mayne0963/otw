"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandlers = exports.paymentWebhook = exports.stripeWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const firebase_functions_1 = require("firebase-functions");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const db = admin.firestore();
/**
 * Handle Stripe webhook events
 */
exports.stripeWebhook = (0, https_1.onRequest)(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        firebase_functions_1.logger.error('Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;
            default:
                firebase_functions_1.logger.info(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        firebase_functions_1.logger.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
    return;
});
/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
        firebase_functions_1.logger.error('No order ID found in payment intent metadata');
        return;
    }
    try {
        // Update order status
        await db.collection('orders').doc(orderId).update({
            status: 'paid',
            paymentIntentId: paymentIntent.id,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Log payment event
        await db.collection('payment_logs').add({
            type: 'payment_success',
            orderId,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        firebase_functions_1.logger.info(`Payment succeeded for order ${orderId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error handling payment success:', error);
    }
}
/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
        firebase_functions_1.logger.error('No order ID found in payment intent metadata');
        return;
    }
    try {
        // Update order status
        await db.collection('orders').doc(orderId).update({
            status: 'payment_failed',
            paymentIntentId: paymentIntent.id,
            failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Log payment event
        await db.collection('payment_logs').add({
            type: 'payment_failed',
            orderId,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            error: paymentIntent.last_payment_error?.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        firebase_functions_1.logger.error(`Payment failed for order ${orderId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error handling payment failure:', error);
    }
}
/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription) {
    try {
        const customerId = subscription.customer;
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) {
            firebase_functions_1.logger.error('Customer was deleted');
            return;
        }
        const userId = customer.metadata?.userId;
        if (!userId) {
            firebase_functions_1.logger.error('No user ID found in customer metadata');
            return;
        }
        // Create subscription record
        await db.collection('subscriptions').doc(subscription.id).set({
            userId,
            customerId,
            status: subscription.status,
            priceId: subscription.items.data[0]?.price.id,
            currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
            currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update user subscription status
        await db.collection('users').doc(userId).update({
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        firebase_functions_1.logger.info(`Subscription created for user ${userId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error handling subscription creation:', error);
    }
}
/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription) {
    try {
        // Update subscription record
        await db.collection('subscriptions').doc(subscription.id).update({
            status: subscription.status,
            currentPeriodStart: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
            currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Get user ID from subscription
        const subscriptionDoc = await db.collection('subscriptions').doc(subscription.id).get();
        const userId = subscriptionDoc.data()?.userId;
        if (userId) {
            // Update user subscription status
            await db.collection('users').doc(userId).update({
                subscriptionStatus: subscription.status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        firebase_functions_1.logger.info(`Subscription updated: ${subscription.id}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error handling subscription update:', error);
    }
}
/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription) {
    try {
        // Update subscription record
        await db.collection('subscriptions').doc(subscription.id).update({
            status: 'canceled',
            canceledAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Get user ID from subscription
        const subscriptionDoc = await db.collection('subscriptions').doc(subscription.id).get();
        const userId = subscriptionDoc.data()?.userId;
        if (userId) {
            // Update user subscription status
            await db.collection('users').doc(userId).update({
                subscriptionStatus: 'canceled',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        firebase_functions_1.logger.info(`Subscription canceled: ${subscription.id}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error handling subscription deletion:', error);
    }
}
/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice) {
    try {
        // Log invoice payment
        await db.collection('invoice_logs').add({
            type: 'payment_succeeded',
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        firebase_functions_1.logger.info(`Invoice payment succeeded: ${invoice.id}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error handling invoice payment success:', error);
    }
}
/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice) {
    try {
        // Log invoice payment failure
        await db.collection('invoice_logs').add({
            type: 'payment_failed',
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            amount: invoice.amount_due,
            currency: invoice.currency,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        firebase_functions_1.logger.error(`Invoice payment failed: ${invoice.id}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error handling invoice payment failure:', error);
    }
}
/**
 * Generic payment webhook handler
 */
exports.paymentWebhook = (0, https_1.onRequest)(async (req, res) => {
    try {
        const { type, data } = req.body;
        switch (type) {
            case 'payment.completed':
                await handleGenericPaymentCompleted(data);
                break;
            case 'payment.refunded':
                await handleGenericPaymentRefunded(data);
                break;
            default:
                firebase_functions_1.logger.info(`Unhandled payment webhook type: ${type}`);
        }
        res.json({ success: true });
    }
    catch (error) {
        firebase_functions_1.logger.error('Error processing payment webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});
/**
 * Handle generic payment completion
 */
async function handleGenericPaymentCompleted(data) {
    try {
        await db.collection('payment_events').add({
            type: 'payment_completed',
            data,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        firebase_functions_1.logger.info('Generic payment completed');
    }
    catch (error) {
        firebase_functions_1.logger.error('Error handling generic payment completion:', error);
    }
}
/**
 * Handle generic payment refund
 */
async function handleGenericPaymentRefunded(data) {
    try {
        await db.collection('payment_events').add({
            type: 'payment_refunded',
            data,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        firebase_functions_1.logger.info('Generic payment refunded');
    }
    catch (error) {
        firebase_functions_1.logger.error('Error handling generic payment refund:', error);
    }
}
exports.webhookHandlers = {
    stripeWebhook: exports.stripeWebhook,
    paymentWebhook: exports.paymentWebhook,
};
//# sourceMappingURL=stripeWebhooks.js.map