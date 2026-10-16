"require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function importDatabase() {
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
      multipleStatements: true,
    });

    console.log('Connected to Aiven MySQL.');

    const [tables] = await connection.query('SHOW TABLES');

    if (tables.length > 0) {
      console.log(
        'Import cancelled: the database already contains tables.'
      );
      console.log(tables);
      return;
    }

    const sqlPath = path.join(__dirname, 'bincom_test.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Importing election database...');
    await connection.query(sql);

    console.log('SQL import completed successfully!');

    const [importedTables] = await connection.query('SHOW TABLES');

    console.log('\nTables created:');

    for (const table of importedTables) {
      console.log(Object.values(table)[0]);
    }

    console.log(`\nTotal tables: ${importedTables.length}`);
  } catch (error) {
    console.error('\nDatabase import failed:');
    console.error(error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

importDatabase();
