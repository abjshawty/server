import { config } from 'dotenv';
import { name, version, repository } from '../../package.json';

export type role = 'producer' | 'consumer' | 'both' | 'none';

process.env.NODE_ENV !== 'production' ? config() : '';
// * The following variables are used to configure the server
// * The variables are read from the .env file
// * The ideal scenario is to make as much of the .env file optional as possible

// Central Configuration
export const apiName: string = `${name[0].toUpperCase() + name.slice(1)}` || 'Server';
export const apiVersion: string = `v${version.split('.')[0]}` || 'v1';
export const authEnabled: boolean = process.env.AUTH_ENABLED === '1' || false;
export const corsOrigin: string =
	process.env.CORS_ORIGIN || `http://${process.env.APP_HOST || 'localhost'}:${process.env.APP_PORT || 3000}`;
export const database_url: string = `${process.env.DATABASE_URL}` || 'mysql://root@localhost:3306/data';
export const host: string = process.env.APP_HOST || 'localhost';

export const jwtPublicKey: string = process.env.JWT_PUBLIC_KEY || 'secret';
export const jwtSecret: string = process.env.JWT_SECRET || 'secret';
export const kafkaBroker: string = process.env.KAFKA_BROKER || '';
export const kafkaClientId: string = process.env.KAFKA_CLIENT_ID || '';
export const kafkaGroupId: string = process.env.KAFKA_GROUP_ID || 'null';
export const language: string = process.env.LANGUAGE || 'en-US';
export const murder: () => void = () => process.exit(0);
export const port: number = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000;

// API Performance
export const compressionEnabled: boolean = process.env.COMPRESSION_ENABLED ? process.env.COMPRESSION_ENABLED === '1' : true;

export const redisUrl: string = process.env.REDIS_URL || '';
export const topics: string[] = process.env.KAFKA_TOPICS ? process.env.KAFKA_TOPICS.split(',') : [];
export const role: role = (process.env.KAFKA_ROLE as role) || 'none';

// Better Auth Configuration
export const githubClientId: string | undefined = process.env.GITHUB_CLIENT_ID;
export const githubClientSecret: string | undefined = process.env.GITHUB_CLIENT_SECRET;
export const gitlabClientId: string | undefined = process.env.GITLAB_CLIENT_ID;
export const gitlabClientSecret: string | undefined = process.env.GITLAB_CLIENT_SECRET;
export const googleClientId: string | undefined = process.env.GOOGLE_CLIENT_ID;
export const googleClientSecret: string | undefined = process.env.GOOGLE_CLIENT_SECRET;
export const discordClientId: string | undefined = process.env.DISCORD_CLIENT_ID;
export const discordClientSecret: string | undefined = process.env.DISCORD_CLIENT_SECRET;

// ImageKit Configuration
export const imageKitApiKey: string | undefined = process.env.IMAGEKIT_API_KEY;


export const email_account: string = process.env.EMAIL_ACCOUNT || 'onboarding@resend.dev';
export const email_test_account: string = process.env.EMAIL_TEST_ACCOUNT || 'delivered@resend.dev';

export const uptime: () => number = () => process.uptime();
export const repo_url: string = repository.url || 'https://github.com';

// TODO: Paydunya Configuration
// TODO: Logging Configuration (Add Debug option to server template to avoid log floods)
// TODO: Twilio Configuration
// TODO: Redis Configuration
// TODO: Mail Configuration
// TODO: AWS S3 Configuration
// TODO: Sentry Configuration
// TODO: Kafka Configuration

