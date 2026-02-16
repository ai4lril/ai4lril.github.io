'use client';

import { useEffect } from 'react';
import { realtimeClient } from '@/lib/realtime';
import { showToast } from '@/lib/toast';

/**
 * Listens for real-time notifications when user is authenticated.
 * Shows toast when notification event received (e.g. "Your sentence was approved").
 */
export function RealtimeNotificationListener() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    realtimeClient.connect(token);

    const onNotification = (data: unknown) => {
      const d = data as { message?: string; type?: string };
      if (d?.message) {
        showToast(
          d.message,
          d.type === 'error' ? 'error' : 'success',
          6000,
        );
      }
    };

    realtimeClient.on('notification', onNotification);

    return () => {
      realtimeClient.off('notification', onNotification);
      realtimeClient.disconnect();
    };
  }, []);

  return null;
}
