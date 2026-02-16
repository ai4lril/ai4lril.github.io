'use client';

import { useEffect, useCallback, useRef } from 'react';
import { realtimeClient } from './realtime';

export function useWebSocket(token: string | null) {
  const listenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());

  useEffect(() => {
    if (!token) {
      return;
    }

    realtimeClient.connect(token);

    return () => {
      // Clean up listeners on unmount
      listenersRef.current.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          realtimeClient.off(event, callback);
        });
      });
      listenersRef.current.clear();
    };
  }, [token]);

  const on = useCallback((event: string, callback: (data: unknown) => void) => {
    if (!token) {
      return;
    }

    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }

    listenersRef.current.get(event)!.add(callback);
    realtimeClient.on(event, callback);
  }, [token]);

  const off = useCallback((event: string, callback?: (data: unknown) => void) => {
    if (callback) {
      listenersRef.current.get(event)?.delete(callback);
    } else {
      listenersRef.current.delete(event);
    }
    realtimeClient.off(event, callback);
  }, []);

  const subscribe = useCallback((channels: string[]) => {
    if (token) {
      realtimeClient.subscribe(channels);
    }
  }, [token]);

  const unsubscribe = useCallback((channels: string[]) => {
    realtimeClient.unsubscribe(channels);
  }, []);

  const isConnected = useCallback(() => {
    return realtimeClient.isConnected();
  }, []);

  return {
    on,
    off,
    subscribe,
    unsubscribe,
    isConnected,
  };
}
