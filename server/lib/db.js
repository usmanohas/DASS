import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let connection;

export const connectToDatabase = async () => {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      dateStrings: true ,
    });
    //console.log('Connected to MySQL Database');
  }
  return connection;
};
/* FOR PRODUCTION
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  dateStrings: true,
});

export const connectToDatabase = async () => {
  return pool;
};


import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let connection;

export const connectToDatabase = async () => {
  try {
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        dateStrings: true,
      });

      console.log("✅ MySQL connected");
    }

    return connection;
  } catch (err) {
    console.error("❌ DB CONNECTION ERROR:", err.message);
    throw err; // important so login fails visibly
  }
};

*/
