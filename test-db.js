require('dotenv').config();

const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;

  try {
    console.log('Connecting to Aiven MySQL...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
  ca: require('fs').readFileSync(
    require('path').join(__dirname, 'certs', 'ca.pem'),
    'utf8'
  ),
  rejectUnauthorized: true,
},
      connectTimeout: 15000,
    });

    console.log('Connected successfully!');

    const [rows] = await connection.query(
      'SELECT VERSION() AS mysql_version, DATABASE() AS database_name'
    );

    console.log('Database details:');
    console.table(rows);
  } catch (error) {
    console.error('Connection failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();