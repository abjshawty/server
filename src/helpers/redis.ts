import { createClient, RedisClientType } from 'redis';
import { env } from '.';


class RedisService {
    private client: RedisClientType;
    constructor () {
        this.client = this.init();
    }
    init (): RedisClientType {
        this.client = createClient({
            url: env.redisUrl
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error', err);
        });
        this.connect();
        return this.client;
    }
    async connect (): Promise<boolean> {
        await this.client.connect()
            .catch((err) => {
                console.error('Redis Client Error', err);
                throw err;
            });
        return true;
    }
    async get (key: string): Promise<
        string | string[] | { [x: string]: string; } | { value: string; score: number; }[] | null> {
        const keyType = await this.client.type(key);
        switch (keyType) {
            case 'string':
                return this.client.get(key);
            case 'hash':
                return this.client.hGetAll(key);
            case 'list':
                return this.client.lRange(key, 0, -1);
            case 'set':
                return this.client.sMembers(key);
            case 'zset':
                return this.client.zRangeWithScores(key, 0, -1);
            default:
                return `Key type '${keyType}' is not supported for automatic retrieval`;
        }
    }
    async set (key: string, value: string): Promise<boolean> {
        await this.client.set(key, value)
            .catch((err) => {
                console.error('Redis Client Set Error', err);
                throw err;
            });
        return true;
    }
    async del (key: string): Promise<boolean> {
        await this.client.del(key)
            .catch((err) => {
                console.error('Redis Client Del Error', err);
                throw err;
            });
        return true;
    }
    disconnect (): void {
        try {
            this.client.destroy();
        } catch (error) {
            console.error('Redis Client Error', error);
            throw error;
        }
    }
}

export default new RedisService();