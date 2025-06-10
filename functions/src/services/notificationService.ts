import * as functions from 'firebase-functions';
import * as functionsV2 from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

const db = admin.firestore();

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your preferred email service
    auth: {
      user: functions.config().email?.user || process.env.EMAIL_USER,
      pass: functions.config().email?.password || process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Notification service functions for handling various types of notifications
 */
export const notificationService = {
  /**
   * Send order-related notifications (email and push)
   */
  sendOrderNotification: functionsV2.https.onCall(async (request) => {
    if (!request.auth) {
      throw new functionsV2.https.HttpsError(
        'unauthenticated',
        'You must be logged in to send notifications.'
      );
    }
    
    const { data } = request;
    const { orderId, type, customMessage } = data;
    
    if (!orderId || !type) {
      throw new functionsV2.https.HttpsError(
        'invalid-argument',
        'Order ID and notification type are required.'
      );
    }
    
    try {
      // Get order data
      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        throw new functionsV2.https.HttpsError(
          'not-found',
          'Order not found.'
        );
      }
      
      const orderData = orderDoc.data();
      if (!orderData) {
        throw new functionsV2.https.HttpsError(
          'internal',
          'Order data is missing.'
        );
      }
      
      // Get user data
      const userDoc = await db.collection('users').doc(orderData.userRef).get();
      if (!userDoc.exists) {
        throw new functionsV2.https.HttpsError(
          'not-found',
          'User not found.'
        );
      }
      
      const userData = userDoc.data();
      if (!userData) {
        throw new functionsV2.https.HttpsError(
          'internal',
          'User data is missing.'
        );
      }
      
      // Prepare notification content based on type
      let title = '';
      let body = '';
      let emailSubject = '';
      let emailHtml = '';
      
      switch (type) {
        case 'order_confirmed':
          title = 'Order Confirmed';
          body = `Your order #${orderId} has been confirmed and is being prepared.`;
          emailSubject = `Order Confirmation - #${orderId}`;
          emailHtml = `
            <h2>Order Confirmed!</h2>
            <p>Hi ${userData.displayName || 'Customer'},</p>
            <p>Your order #${orderId} has been confirmed and is being prepared.</p>
            <h3>Order Details:</h3>
            <p><strong>Total:</strong> $${orderData.total?.toFixed(2)}</p>
            <p><strong>Status:</strong> ${orderData.status}</p>
            <p>We'll notify you when your order is ready!</p>
            <p>Thank you for choosing us!</p>
          `;
          break;
          
        case 'order_ready':
          title = 'Order Ready for Pickup';
          body = `Your order #${orderId} is ready for pickup!`;
          emailSubject = `Order Ready - #${orderId}`;
          emailHtml = `
            <h2>Your Order is Ready!</h2>
            <p>Hi ${userData.displayName || 'Customer'},</p>
            <p>Great news! Your order #${orderId} is ready for pickup.</p>
            <p>Please come to our location to collect your order.</p>
            <p>Thank you for your patience!</p>
          `;
          break;
          
        case 'order_delivered':
          title = 'Order Delivered';
          body = `Your order #${orderId} has been delivered. Enjoy your meal!`;
          emailSubject = `Order Delivered - #${orderId}`;
          emailHtml = `
            <h2>Order Delivered!</h2>
            <p>Hi ${userData.displayName || 'Customer'},</p>
            <p>Your order #${orderId} has been successfully delivered.</p>
            <p>We hope you enjoy your meal!</p>
            <p>Please consider leaving us a review.</p>
          `;
          break;
          
        case 'custom':
          title = customMessage?.title || 'Order Update';
          body = customMessage?.body || `Update for order #${orderId}`;
          emailSubject = customMessage?.subject || `Order Update - #${orderId}`;
          emailHtml = customMessage?.html || `<p>${body}</p>`;
          break;
          
        default:
          throw new functionsV2.https.HttpsError(
            'invalid-argument',
            'Invalid notification type.'
          );
      }
      
      const results = [];
      
      // Send push notification if user has FCM token
      if (userData.fcmToken && userData.preferences?.notifications?.push !== false) {
        try {
          const message = {
            notification: { title, body },
            token: userData.fcmToken,
            data: {
              orderId,
              type,
              timestamp: new Date().toISOString(),
            },
          };
          
          const response = await admin.messaging().send(message);
          results.push({ type: 'push', success: true, messageId: response });
        } catch (error) {
          console.error('Error sending push notification:', error);
          results.push({ type: 'push', success: false, error: error instanceof Error ? error.message : String(error) });
        }
      }
      
      // Send email notification if user has email and notifications enabled
      if (userData.email && userData.preferences?.notifications?.email !== false) {
        try {
          const transporter = createTransporter();
          
          const mailOptions = {
            from: functions.config().email?.from || process.env.EMAIL_FROM || 'noreply@yourapp.com',
            to: userData.email,
            subject: emailSubject,
            html: emailHtml,
          };
          
          await transporter.sendMail(mailOptions);
          results.push({ type: 'email', success: true });
        } catch (error) {
          console.error('Error sending email notification:', error);
          results.push({ type: 'email', success: false, error: error instanceof Error ? error.message : String(error) });
        }
      }
      
      // Log notification in Firestore
      await db.collection('notifications').add({
        userId: orderData.userRef,
        orderId,
        type,
        title,
        body,
        sent: results.some(r => r.success),
        results,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return { success: true, results };
    } catch (error) {
      console.error('Error sending order notification:', error);
      throw new functionsV2.https.HttpsError(
        'internal',
        `Failed to send order notification: ${(error as Error).message}`
      );
    }
  }),

  /**
   * Send welcome email to new users
   */
  sendWelcomeEmail: functionsV2.https.onCall(async (request) => {
    if (!request.auth) {
      throw new functionsV2.https.HttpsError(
        'unauthenticated',
        'You must be logged in to send welcome email.'
      );
    }
    
    const userId = request.auth.uid;
    
    try {
      // Get user data
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new functionsV2.https.HttpsError(
          'not-found',
          'User not found.'
        );
      }
      
      const userData = userDoc.data();
      
      if (!userData) {
        throw new functionsV2.https.HttpsError(
          'not-found',
          'User data not found.'
        );
      }
      
      if (!userData.email) {
        throw new functionsV2.https.HttpsError(
          'invalid-argument',
          'User email not found.'
        );
      }
      
      const transporter = createTransporter();
      
      const mailOptions = {
        from: functions.config().email?.from || process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: userData.email,
        subject: 'Welcome to Our Platform!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to Our Platform!</h1>
            <p>Hi ${userData.displayName || 'there'},</p>
            <p>Thank you for joining our platform! We're excited to have you as part of our community.</p>
            
            <h2>Getting Started:</h2>
            <ul>
              <li>Complete your profile to get personalized recommendations</li>
              <li>Browse our restaurants and discover new favorites</li>
              <li>Earn loyalty points with every order</li>
              <li>Get exclusive offers and promotions</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${functions.config().app?.url || 'https://yourapp.com'}/dashboard" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Get Started
              </a>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Welcome aboard!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              This email was sent to ${userData.email}. If you didn't create an account, please ignore this email.
            </p>
          </div>
        `,
      };
      
      await transporter.sendMail(mailOptions);
      
      // Log welcome email sent
      await db.collection('notifications').add({
        userId,
        type: 'welcome_email',
        title: 'Welcome Email',
        body: 'Welcome email sent to new user',
        sent: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new functionsV2.https.HttpsError(
        'internal',
        `Failed to send welcome email: ${(error as Error).message}`
      );
    }
  }),

  /**
   * Send password reset email
   */
  sendPasswordResetEmail: functionsV2.https.onCall(async (request) => {
    const { data } = request;
    const { email } = data;
    
    if (!email) {
      throw new functionsV2.https.HttpsError(
        'invalid-argument',
        'Email is required.'
      );
    }
    
    try {
      // Generate password reset link
      const resetLink = await admin.auth().generatePasswordResetLink(email);
      
      const transporter = createTransporter();
      
      const mailOptions = {
        from: functions.config().email?.from || process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
            <p>Hi there,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}">${resetLink}</a>
            </p>
          </div>
        `,
      };
      
      await transporter.sendMail(mailOptions);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new functionsV2.https.HttpsError(
        'internal',
        `Failed to send password reset email: ${(error as Error).message}`
      );
    }
  }),

  /**
   * Send promotional email to users
   */
  sendPromotionalEmail: functionsV2.https.onCall(async (request) => {
     // Only allow admin users to send promotional emails
     if (!request.auth) {
       throw new functionsV2.https.HttpsError(
         'unauthenticated',
         'You must be logged in to send promotional emails.'
       );
     }
    
    const { data } = request;
    const { subject, htmlContent, targetUsers, sendToAll } = data;
    
    if (!subject || !htmlContent) {
       throw new functionsV2.https.HttpsError(
         'invalid-argument',
         'Email and subject are required.'
       );
     }
    
    try {
      let userQuery: admin.firestore.Query = db.collection('users');
      
      // If not sending to all users, filter by target users
      if (!sendToAll && targetUsers && targetUsers.length > 0) {
        userQuery = userQuery.where(admin.firestore.FieldPath.documentId(), 'in', targetUsers);
      }
      
      // Only send to users who have email notifications enabled
      userQuery = userQuery.where('preferences.notifications.email', '!=', false);
      
      const usersSnapshot = await userQuery.get();
      const transporter = createTransporter();
      
      const emailPromises: Promise<any>[] = [];
      const results: { success: boolean; userId: string; email: string; error?: string }[] = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email) {
          const mailOptions = {
            from: functions.config().email?.from || process.env.EMAIL_FROM || 'noreply@yourapp.com',
            to: userData.email,
            subject,
            html: htmlContent.replace('{{displayName}}', userData.displayName || 'Customer'),
          };
          
          emailPromises.push(
            transporter.sendMail(mailOptions)
              .then(() => {
                results.push({ userId: doc.id, email: userData.email, success: true });
              })
              .catch((error) => {
                console.error(`Error sending email to ${userData.email}:`, error);
                results.push({ userId: doc.id, email: userData.email, success: false, error: error instanceof Error ? error.message : String(error) });
              })
          );
        }
      });
      
      await Promise.all(emailPromises);
      
      // Log promotional email campaign
      await db.collection('email_campaigns').add({
        subject,
        htmlContent,
        targetUsers: sendToAll ? 'all' : targetUsers,
        sentBy: request.auth.uid,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        results,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return {
        success: true,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        results,
      };
    } catch (error) {
      console.error('Error sending promotional email:', error);
      throw new functionsV2.https.HttpsError(
        'internal',
        `Failed to send promotional email: ${(error as Error).message}`
      );
    }
  }),

  /**
   * Send push notification to specific users or topics
   */
  sendPushNotification: functionsV2.https.onCall(async (request) => {
    if (!request.auth) {
      throw new functionsV2.https.HttpsError(
        'unauthenticated',
        'You must be logged in to send notifications.'
      );
    }
    
    const { data } = request;
    const { title, body, topic, targetUsers, data: notificationData } = data;
    
    if (!title || !body) {
       throw new functionsV2.https.HttpsError(
         'invalid-argument',
         'User ID, title, and body are required.'
       );
     }
    
    try {
      const results = [];
      
      if (topic) {
        // Send to topic
        const message = {
          notification: { title, body },
          topic,
          data: notificationData || {},
        };
        
        const response = await admin.messaging().send(message);
        results.push({ type: 'topic', topic, success: true, messageId: response });
      } else if (targetUsers && targetUsers.length > 0) {
        // Send to specific users
        const userDocs = await Promise.all(
          targetUsers.map((userId: string) => db.collection('users').doc(userId).get())
        );
        
        const tokens: string[] = [];
        userDocs.forEach((doc, index) => {
          if (doc.exists) {
            const userData = doc.data();
            if (userData.fcmToken && userData.preferences?.notifications?.push !== false) {
              tokens.push(userData.fcmToken);
            }
          }
        });
        
        if (tokens.length > 0) {
          const message = {
            notification: { title, body },
            tokens,
            data: notificationData || {},
          };
          
          const response = await admin.messaging().sendMulticast(message);
          results.push({
            type: 'multicast',
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses,
          });
        }
      } else {
        throw new functionsV2.https.HttpsError(
          'invalid-argument',
          'Either topic or targetUsers must be provided.'
        );
      }
      
      return { success: true, results };
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw new functionsV2.https.HttpsError(
        'internal',
        `Failed to send push notification: ${(error as Error).message}`
      );
    }
  }),
};