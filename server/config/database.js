import mysql from 'mysql2/promise';
import { env } from './environment.js';

export const pool = mysql.createPool({
  ...env.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});
