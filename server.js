const express = require('express');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_USER = process.env.DB_USER || 'postgres';
const HOST = process.env.HOST || 'localhost';
const DB = process.env.DB || 'postgres';
const DB_PASS = process.env.DB_PASS || 'daisy';
const DB_PORT = process.env.DB_PORT || 5432;
const CSV_FILE_PATH = process.env.CSV_FILE_PATH;
const { Client } = require('pg');

// PostgreSQL client
const client = new Client({
  user: DB_USER, // Change this with your PostgreSQL user
  host: HOST, // Change to your PostgreSQL host if needed
  database: DB, // Your database name
  password: DB_PASS, // Your password
  port: DB_PORT, // PostgreSQL default port
});

// Connect to PostgreSQL
client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Connection error', err.stack));


const filePath = './large.csv'; // or from .env


function splitUserPayload(payload) {
  const { name, age, address, ...rest } = payload;

  return {
    name,
    age,
    address,
    additional_info: Object.keys(rest).length ? rest : null
  };
}

async function insertUser(user) {
  user = splitUserPayload(user)
  const query = `
    INSERT INTO users (name, age, address, additional_info)
    VALUES ($1, $2, $3, $4)
  `;

  const values = [
	  user.name,user.age,user.address,user.additional_info
  ];

  try {
    await client.query(query, values);
    console.log('User inserted:', user.name.firstName);
  } catch (err) {
    console.error('Error inserting user:', err);
  }
}

async function processCSV(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let headers = [];
  const rows = [];

  for await (const line of rl) {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, '')); // Trim quotes and spaces

    if (headers.length === 0) {
      headers = values.map(v => v.trim());
    } else {
      const row = {};

      headers.forEach((key, i) => {
        const value = values[i]?.trim();

        // Skip undefined values or empty fields
        if (value === '' || value === undefined) return;

        // Handle nested keys (e.g., "name.firstName" becomes { name: { firstName: value } })
        const keys = key.split('.');
        if (keys.length > 1) {
          let tempObj = row;
          keys.forEach((subKey, j) => {
            if (j === keys.length - 1) {
              tempObj[subKey] = value;
            } else {
              if (!tempObj[subKey]) tempObj[subKey] = {};
              tempObj = tempObj[subKey];
            }
          });
        }
	else {
          row[key] = value;
        }
      });
      insertUser(row)
      rows.push(row);
    }

    if (rows.length >= 10) break; // Optional: limit to 100 rows
  }

fs.writeFile('converted.jsons',JSON.stringify(rows),(err) => 
	 {
		if (!err) {console.log('jsons backup saved in converted.jsons file')}
	 })
  console.log(rows); // or return rows as JSON
}

async function getAgeGroupStats() {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE age < 20) AS below_20,
      COUNT(*) FILTER (WHERE age BETWEEN 20 AND 40) AS between_20_40,
      COUNT(*) FILTER (WHERE age BETWEEN 41 AND 60) AS between_40_60,
      COUNT(*) FILTER (WHERE age > 60) AS above_60
    FROM users;
  `;

  const result = await client.query(query);
  console.log('age stats', result.rows);
}

// main api
app.get('/process-csv', async (req, res) => {
  const filePath = CSV_FILE_PATH;
  if (!filePath) {
    return res.status(400).json({ error: 'CSV_PATH not defined in .env' });
  }
  try {
    await processCSV(filePath);
    await getAgeGroupStats();
    res.status(200).json({message: 'csv parsed to json , stored in db and age groups consoled on server console.'})
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process CSV' });
  }
});

app.listen(PORT, (err,) => {
    if (!err) {
        console.log(`Server running on http://localhost:${PORT}`);
    }
    else {
        console.error(`${err}`)
    }
});
