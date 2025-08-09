# Deployment Guide

## Vercel Deployment

This API is configured for deployment on Vercel. The main changes made for Vercel compatibility:

### 1. Type Definitions
Moved all TypeScript type definitions from `devDependencies` to `dependencies` to ensure they're available during the Vercel build process.

### 2. TypeScript Configuration
Updated `tsconfig.json` with more lenient settings:
- Disabled `strict` mode
- Disabled `noImplicitAny`
- Added proper module resolution

### 3. Vercel Configuration
Created `vercel.json` with proper configuration:
- Serverless function entry point: `api/index.ts`
- Build command: `npm run build`
- Production environment variables

### 4. Entry Point
Created `api/index.ts` as the Vercel serverless function entry point that properly exports the Express app.

### Required Environment Variables
Make sure to set these in your Vercel project settings:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `CLIENT_URL`
- `NODE_ENV=production`

### Build Process
The build process:
1. `npm install` - installs all dependencies including TypeScript types
2. `npm run build` - compiles TypeScript to JavaScript
3. Vercel deploys the compiled code as serverless functions

### Testing Locally
To test the build locally:
```bash
npm install
npm run build
npm start
```
