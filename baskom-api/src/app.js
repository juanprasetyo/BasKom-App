const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDefinition = require('./docs/swaggerDef');
const passport = require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const userRolesRoutes = require('./routes/userRolesRoutes');
const upgradeRoleRoutes = require('./routes/upgradeRoleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const options = {
  swaggerDefinition,
  apis: ['./src/docs/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const app = express();
app.use(express.json());
app.use(passport.initialize());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', authRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', userRolesRoutes);
app.use('/api/v1', upgradeRoleRoutes);
app.use('/api/v1', categoryRoutes);
app.use('/api/v1', productRoutes);

module.exports = app;
