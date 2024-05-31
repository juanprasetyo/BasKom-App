const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.NODE_ENV === 'test' ? process.env.DB_TEST_NAME : process.env.DB_NAME,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end(),
};
