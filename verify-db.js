require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function verifyDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        ca: fs.readFileSync(
          path.join(__dirname, 'certs', 'ca.pem'),
          'utf8'
        ),
        rejectUnauthorized: true,
      },
    });

    const tables = [
      'agentname',
      'announced_lga_results',
      'announced_pu_results',
      'announced_state_results',
      'announced_ward_results',
      'lga',
      'party',
      'polling_unit',
      'states',
      'ward',
    ];

    console.log('\nBINCOM DATABASE VERIFICATION\n');

    for (const table of tables) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) AS total FROM \`${table}\``
      );

      console.log(`${table}: ${rows[0].total} records`);
    }

    console.log('\nVerification completed!');
  } catch (error) {
    console.error('Verification failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyDatabase();
