import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tuaregue Automotiva API',
      version: '1.0.0',
      description: 'API documentation for Tuaregue Automotiva',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    tags: [
      {
        name: 'Employee',
        description: 'Endpoints related to employee operations',
      },
    ],
  },
  apis: ['./src/modules/*/*.routes.ts'],
};

const specs = swaggerJSDoc(options);

export default specs;
