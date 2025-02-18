declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      API_VERSION: string;
      
      // Database
      DATABASE_URL: string;
      DATABASE_SSL: string;
      
      // Authentication
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_EXPIRES_IN: string;
      JWT_REFRESH_EXPIRES_IN: string;
      
      // Rate Limiting
      RATE_LIMIT_WINDOW: string;
      RATE_LIMIT_MAX_REQUESTS: string;
      
      // Logging
      LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
      
      // RevenueCat
      REVENUECAT_API_KEY: string;
      REVENUECAT_WEBHOOK_SECRET: string;
      
      // CORS
      CORS_ORIGIN: string;
      
      // Email
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASSWORD: string;
      EMAIL_FROM: string;
      
      // AWS (Optional)
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_REGION?: string;
      S3_BUCKET?: string;
    }
  }
}

export {};
