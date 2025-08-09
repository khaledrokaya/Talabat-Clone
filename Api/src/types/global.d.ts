/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    PORT?: string;
    MONGO_URI?: string;
    JWT_SECRET?: string;
    JWT_REFRESH_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    JWT_REFRESH_EXPIRES_IN?: string;
    BCRYPT_ROUNDS?: string;
    OTP_LENGTH?: string;
    OTP_EXPIRES_IN?: string;
    EMAIL_HOST?: string;
    EMAIL_PORT?: string;
    EMAIL_SECURE?: string;
    EMAIL_USER?: string;
    EMAIL_PASS?: string;
    EMAIL_FROM?: string;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    FRONTEND_URL?: string;
    CORS_ORIGIN?: string;
    RATE_LIMIT_WINDOW_MS?: string;
    RATE_LIMIT_MAX_REQUESTS?: string;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
  exit: (code: number) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
};

declare var require: {
  main: any;
  (id: string): any;
};

declare var module: {
  exports: any;
};

declare var __dirname: string;
declare var __filename: string;
declare var Buffer: any;

// Add Error.captureStackTrace if missing
interface ErrorConstructor {
  captureStackTrace?: (targetObject: any, constructorOpt?: Function) => void;
}
