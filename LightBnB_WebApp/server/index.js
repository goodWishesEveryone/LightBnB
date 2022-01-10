const { Pool } = require('pg');

const pool = new Pool({
  user: 'sm',
  password: '123',
  host: 'localhost',
  database: 'lightbnb',
  port: "3000"
});

module.exports = {
  query: (text, params) => {
    console.log('The executed query:', {text});
    return pool.query(text, params);
  }
};