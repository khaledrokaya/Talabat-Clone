import App from '../src/app';

// Create app instance
const app = new App();

// Export the Express app for Vercel
export default app.app;
