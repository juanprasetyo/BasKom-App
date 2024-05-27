require('dotenv').config();

const protocol = process.env.PROTOCOL || 'http';
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `${protocol}://${host}:${port}`;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Baskom API',
    version: '1.0.0',
    description: 'This is a REST API for Baskom App',
  },
  servers: [
    {
      url: `${baseUrl}/api/v1`,
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
