'use client';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Check if permission is granted
   */
  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Create and show a notification
   */
  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported()) {
      console.warn('Notifications are not supported in this browser');
      return null;
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }
    }

    const notificationOptions: NotificationOptions = {
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      ...options,
    };

    try {
      // Try to use service worker notification if available
      if (this.registration && 'showNotification' in this.registration) {
        await this.registration.showNotification(options.title, {
          body: notificationOptions.body,
          icon: notificationOptions.icon,
          badge: notificationOptions.badge,
          tag: notificationOptions.tag,
          data: notificationOptions.data,
          requireInteraction: notificationOptions.requireInteraction,
        });
        return null;
      } else {
        // Fallback to regular notification
        const notification = new Notification(options.title, notificationOptions);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show notification for new message
   */
  async showMessageNotification(
    senderName: string,
    message: string,
    chatId: string,
    avatarUrl?: string
  ): Promise<void> {
    await this.showNotification({
      title: senderName,
      body: message,
      icon: avatarUrl || '/favicon.ico',
      tag: `message-${chatId}`,
      data: { chatId, type: 'message' },
      requireInteraction: false,
    });
  }

  /**
   * Show notification for incoming call
   */
  async showCallNotification(
    callerName: string,
    callType: 'audio' | 'video',
    callId: string,
    avatarUrl?: string
  ): Promise<void> {
    await this.showNotification({
      title: `Incoming ${callType} call`,
      body: `${callerName} is calling you`,
      icon: avatarUrl || '/favicon.ico',
      tag: `call-${callId}`,
      data: { callId, type: 'call', callType },
      requireInteraction: true,
    });
  }

  /**
   * Update badge count (for service worker)
   */
  async updateBadge(count: number): Promise<void> {
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      } catch (error) {
        console.error('Error updating badge:', error);
      }
    }
  }

  /**
   * Set service worker registration
   */
  setServiceWorkerRegistration(registration: ServiceWorkerRegistration): void {
    this.registration = registration;
  }

  /**
   * Handle notification click
   */
  setupNotificationClickHandler(onClick: (data: any) => void): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Handle service worker notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'notificationclick') {
          onClick(event.data.data);
        }
      });
    }

    // Handle regular notifications
    if ('Notification' in window) {
      // This will be handled by the notification's onclick event
      // which should be set when creating the notification
    }
  }
}

export const notificationService = new NotificationService();

// Initialize on client side
if (typeof window !== 'undefined') {
  // Request permission on page load (optional - can be done on user interaction)
  // notificationService.requestPermission();
}




