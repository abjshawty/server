import { version as packageVersion } from '../../package.json';
export const host: string = process.env.APP_HOST || 'localhost';
export const port: number = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000;
export const version: string = `v${packageVersion.split('.')[0]}` || 'v1';
export const corsOrigins: string[] = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'https://localhost:3000'];
