/**
 * Push Notifications Service (Firebase Cloud Messaging)
 * 
 * IMPORTANT: This service is READY but DISABLED by default.
 * To enable:
 * 1. Enable Firebase Cloud Messaging in Firebase Console
 * 2. Add FCM configuration to Firebase config
 * 3. Add service worker for background notifications
 * 4. Set NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED=true
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getApp } from 'firebase/app';

// Check if push notifications are enabled
export const isPushNotificationsEnabled = () => {
  return process.env.NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED === 'true';
};

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  link?: string;
}

export class PushNotificationService {
  private messaging: Messaging | null = null;
  private vapidKey: string;

  constructor() {
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }

  /**
   * Check if notifications are configured
   */
  isConfigured(): boolean {
    return !!this.vapidKey;
  }

  /**
   * Initialize messaging
   */
  private async initializeMessaging(): Promise<void> {
    if (this.messaging) return;

    try {
      const app = getApp();
      this.messaging = getMessaging(app);
    } catch (error) {
      console.error('Failed to initialize messaging:', error);
      throw error;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    if (!this.isSupported() || !this.isConfigured()) {
      console.warn('Push notifications not supported or configured');
      return null;
    }

    if (!isPushNotificationsEnabled()) {
      console.log('Push notifications are disabled');
      return null;
    }

    try {
      await this.initializeMessaging();

      if (!this.messaging) {
        throw new Error('Messaging not initialized');
      }

      // Request permission first
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission not granted');
        return null;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Get token
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration: registration,
      });

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Listen for foreground messages
   */
  async onMessage(callback: (payload: any) => void): Promise<void> {
    if (!this.isSupported() || !this.isConfigured()) {
      return;
    }

    try {
      await this.initializeMessaging();

      if (!this.messaging) {
        throw new Error('Messaging not initialized');
      }

      onMessage(this.messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);

        // Show notification
        if (payload.notification) {
          this.showNotification({
            title: payload.notification.title || 'HICv',
            body: payload.notification.body || '',
            icon: payload.notification.icon || '/icon-192x192.png',
            data: payload.data,
          });
        }
      });
    } catch (error) {
      console.error('Error setting up message listener:', error);
    }
  }

  /**
   * Show local notification
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/badge-72x72.png',
        data: payload.data,
        tag: 'hicv-notification',
        requireInteraction: false,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Save FCM token to database
   */
  async saveFCMToken(userId: string, token: string): Promise<void> {
    try {
      // Save to Appwrite or your database
      // This would be implemented based on your database structure
      console.log('FCM token saved for user:', userId);
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  /**
   * Delete FCM token from database
   */
  async deleteFCMToken(userId: string): Promise<void> {
    try {
      // Delete from Appwrite or your database
      console.log('FCM token deleted for user:', userId);
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }
}

// Singleton instance
let pushNotificationServiceInstance: PushNotificationService | null = null;

export const getPushNotificationService = (): PushNotificationService => {
  if (!pushNotificationServiceInstance) {
    pushNotificationServiceInstance = new PushNotificationService();
  }
  return pushNotificationServiceInstance;
};

// Notification templates
export const notificationTemplates = {
  cvGenerationComplete: (cvName: string): NotificationPayload => ({
    title: 'CV Generation Complete! ✅',
    body: `Your CV "${cvName}" is ready to download.`,
    icon: '/icon-192x192.png',
    link: '/dashboard',
  }),

  cvLimitWarning: (remaining: number): NotificationPayload => ({
    title: 'CV Limit Warning ⚠️',
    body: `You have ${remaining} CV generation${remaining === 1 ? '' : 's'} remaining this month.`,
    icon: '/icon-192x192.png',
    link: '/dashboard/plans',
  }),

  cvLimitReached: (): NotificationPayload => ({
    title: 'CV Limit Reached 🚫',
    body: 'You\'ve reached your monthly CV generation limit. Upgrade for more!',
    icon: '/icon-192x192.png',
    link: '/dashboard/plans',
  }),

  planUpgraded: (plan: string): NotificationPayload => ({
    title: 'Plan Upgraded! 🎉',
    body: `Welcome to ${plan} plan! Enjoy your new benefits.`,
    icon: '/icon-192x192.png',
    link: '/dashboard',
  }),

  apiQuotaWarning: (percentage: number): NotificationPayload => ({
    title: 'API Quota Warning ⚠️',
    body: `You've used ${percentage}% of your API quota this month.`,
    icon: '/icon-192x192.png',
    link: '/dashboard/api-logs',
  }),

  licenseActivated: (): NotificationPayload => ({
    title: 'License Activated! 🔑',
    body: 'Your license has been activated. You can now use API features.',
    icon: '/icon-192x192.png',
    link: '/dashboard/api-keys',
  }),
};

export default PushNotificationService;

