import App from '../src/app';

// Create app instance
const app = new App();

// For Vercel serverless functions, we export the Express app directly
export default app.app;
