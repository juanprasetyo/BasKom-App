require('dotenv').config();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Baskom API',
    version: '1.0.0',
    description: 'This is a REST API for Baskom App',
  },
  servers: [
    {
      url: `${process.env.BASE_URL}/api/v1`,
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

module.exports = swaggerDefinition;
