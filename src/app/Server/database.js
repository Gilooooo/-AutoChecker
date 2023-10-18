const mysql = require('mysql2/promise');
const host = "127.0.0.1";

const pool = mysql.createPool({
  host: host,
  user: 'root',
  password: 'Amine2019',
  database: 'accounts',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection
pool.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database.');
    connection.release(); 
  })
  .catch((err) => {
    console.error('Error connecting:', err);
  });

module.exports = pool;