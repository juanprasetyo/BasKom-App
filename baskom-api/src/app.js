const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const swaggerDefinition = require('./docs/swaggerDef');
const passport = require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');
const userRolesRoutes = require('./routes/userRolesRoutes');
const upgradeRoleRoutes = require('./routes/upgradeRoleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const productCategoryRoutes = require('./routes/productCategoryRoutes');
const productImageRoutes = require('./routes/productImageRoutes');

dotenv.config();

const corsOptions = {
  origin: (process.env.NODE_ENV === 'dev')
    ? 'http://localhost:3000'
    : ['https://admin-baskom.vercel.app', 'https://baskom.vercel.app', 'http://localhost:5174', 'http://localhost:5173'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

const options = {
  swaggerDefinition,
  apis: ['./src/docs/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

app.use('/public', express.static(path.join(__dirname, '../public')));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', authRoutes);
app.use('/api/v1', profileRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', userRolesRoutes);
app.use('/api/v1', upgradeRoleRoutes);
app.use('/api/v1', categoryRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', productCategoryRoutes);
app.use('/api/v1', productImageRoutes);

module.exports = app;
