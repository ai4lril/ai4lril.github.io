import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;

    async onModuleInit() {
        this.client = createClient({
            url: process.env.CACHE_URL || 'redis://dragonfly:6379',
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error', err);
        });

        try {
            await this.client.connect();
            console.log('Connected to Dragonfly cache server');
        } catch (error) {
            console.error('Failed to connect to Dragonfly:', error);
        }
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.disconnect();
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, serializedValue);
            } else {
                await this.client.set(key, serializedValue);
            }
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error('Cache del error:', error);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    generateCacheKey(endpoint: string, params: Record<string, any>): string {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('_');

        return `${endpoint}_${sortedParams}`.replace(/[^a-zA-Z0-9_]/g, '_');
    }
}
