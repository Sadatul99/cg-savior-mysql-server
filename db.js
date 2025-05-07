import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sipto56',
  database: 'saviorDb',
});

export default pool;
