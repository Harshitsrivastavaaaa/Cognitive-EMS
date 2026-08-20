const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/hash_hrms'
});

// Test the connection
pool.connect()
  .then(() => console.log('Successfully connected to PostgreSQL!'))
  .catch(err => console.error('Connection error', err.stack));

// Export the pool so other files can use it
module.exports = {
  query: (text, params) => pool.query(text, params),
};