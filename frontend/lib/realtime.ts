import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5566';

class RealtimeClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`${API_BASE_URL.replace('/api', '')}/realtime`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    // Subscribe to default channels
    this.socket.emit('subscribe', {
      channels: ['notifications', 'activity', 'updates'],
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket.off(event);
    }
  }

  subscribe(channels: string[]): void {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.emit('subscribe', { channels });
  }

  unsubscribe(channels: string[]): void {
    if (!this.socket) {
      return;
    }

    this.socket.emit('unsubscribe', { channels });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const realtimeClient = new RealtimeClient();
