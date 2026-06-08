const sql = require('mssql');
require('dotenv').config();

const config = {
    server:   process.env.DB_SERVER   || 'localhost',
    database: process.env.DB_DATABASE || 'UniEnroll',
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port:     parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt:                false,  // not needed for local/Docker SQL Server
        trustServerCertificate: true,   // required for self-signed Docker certs
        enableArithAbort:       true,
        connectTimeout:         15000,
        requestTimeout:         15000,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

let pool = null;

async function getPool() {
    // If pool exists and is connected, reuse it
    if (pool && pool.connected) return pool;

    // Reset so a failed previous attempt doesn't get reused
    pool = null;

    try {
        pool = await sql.connect(config);
        pool.on('error', () => { pool = null; }); // reset on unexpected disconnect
        return pool;
    } catch (err) {
        pool = null;
        throw err;
    }
}

async function query(queryText, params = {}) {
    const p = await getPool();
    const request = p.request();
    for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
    }
    const result = await request.query(queryText);
    return result.recordset;
}

// Lightweight check used by the app to show a friendly offline message
async function isConnected() {
    try {
        await getPool();
        return true;
    } catch {
        return false;
    }
}

module.exports = { query, isConnected, sql };
