import dotenv from 'dotenv';
import { z } from 'zod';
import { parse } from 'pg-connection-string';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3000'),
  TZ: z.string().default('UTC'),
  DB_NAME: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().default('5432'),
  DB_USER: z.string().optional(),
  DB_USER_PWD: z.string().optional(),
  DB_MIN_POOL_SIZE: z.string().default('5'),
  DB_MAX_POOL_SIZE: z.string().default('10'),
  CORS_URL: z.string().default('http://localhost:3000'),
  ACCESS_TOKEN_VALIDITY_SEC: z.string().default('3600'),
  REFRESH_TOKEN_VALIDITY_SEC: z.string().default('86400'),
  TOKEN_ISSUER: z.string().default('your-issuer'),
  TOKEN_AUDIENCE: z.string().default('your-audience'),
  LOG_DIR: z.string().default('../logs'),
  DATABASE_URL: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_ISSUER_ID: z.string().optional(),
  APPLE_BUNDLE_ID: z.string().optional(),
});

const env = envSchema.parse(process.env);

const constructDatabaseUrl = (): string => {
  const user = env.DB_USER || '';
  const password = env.DB_USER_PWD ? `:${env.DB_USER_PWD}` : '';
  const host = env.DB_HOST || 'localhost';
  const port = env.DB_PORT || '5432';
  const database = env.DB_NAME || 'postgres';

  return `postgres://${user}${password}@${host}:${port}/${database}`;
};

const finalDatabaseUrl = env.DATABASE_URL || constructDatabaseUrl();
const dbConfig = parse(finalDatabaseUrl);

export const environment = env.NODE_ENV;
export const port = parseInt(env.PORT);
export const timezone = env.TZ;

export const db = {
  name: dbConfig.database || '',
  host: dbConfig.host || '',
  port: parseInt(dbConfig.port || '5432'),
  user: dbConfig.user || '',
  password: dbConfig.password || '',
  minPoolSize: parseInt(env.DB_MIN_POOL_SIZE),
  maxPoolSize: parseInt(env.DB_MAX_POOL_SIZE),
};

export const corsUrl = env.CORS_URL;

export const tokenInfo = {
  accessTokenValidity: parseInt(env.ACCESS_TOKEN_VALIDITY_SEC),
  refreshTokenValidity: parseInt(env.REFRESH_TOKEN_VALIDITY_SEC),
  issuer: env.TOKEN_ISSUER,
  audience: env.TOKEN_AUDIENCE,
};

export const logDirectory = env.LOG_DIR;
export const databaseUrl = finalDatabaseUrl;

export const appleConfig = {
  privateKey: env.APPLE_PRIVATE_KEY || '',
  keyId: env.APPLE_KEY_ID || '',
  issuerId: env.APPLE_ISSUER_ID || '',
  bundleId: env.APPLE_BUNDLE_ID || '',
};
