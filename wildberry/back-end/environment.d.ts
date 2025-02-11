declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      TZ: string;
      DB_NAME: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_USER_PWD: string;
      DB_MIN_POOL_SIZE: string;
      DB_MAX_POOL_SIZE: string;
      CORS_URL: string;
      ACCESS_TOKEN_VALIDITY_SEC: string;
      REFRESH_TOKEN_VALIDITY_SEC: string;
      TOKEN_ISSUER: string;
      TOKEN_AUDIENCE: string;
      LOG_DIR: string;
      DATABASE_URL: string;
    }
  }
}

export {};
