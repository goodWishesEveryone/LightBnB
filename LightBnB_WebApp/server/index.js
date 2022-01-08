const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

module.exports = {
  query: (text, params) => {
    console.log('The executed query:', {text});
    return pool.query(text, params);
  }
};