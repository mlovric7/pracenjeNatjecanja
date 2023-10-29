import pg from 'pg';
import dotenv from "dotenv";
dotenv.config()

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'web2db1',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl: true
});

export default pool;
