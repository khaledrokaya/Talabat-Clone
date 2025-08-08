import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Talbat API',
      version: '1.0',
      description:
        'A comprehensive food delivery platform API built with Express.js, TypeScript, and MongoDB',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>',
        },
      },
    },
    paths: {},
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/modules/*/routes.ts',
    './src/modules/*/routes.js',
    './src/modules/*/routes/*.ts',
    './src/modules/*/routes/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
