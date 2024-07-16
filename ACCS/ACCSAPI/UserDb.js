const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Function to create app log
const createAppLog = (message, functionName) => {
    const logMessage = `${new Date().toISOString()} [${functionName}] ${message}\n`;
    fs.appendFileSync(path.join(__dirname, 'app.log'), logMessage);
};

// Database configuration
const config = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'perdiem',
};

// Create a connection pool
const pool = mysql.createPool(config);

// Function to get a connection from the pool
const getMysqlConnection = (callback) => {
    pool.getConnection((err, connection) => {
        if (err) {
            const result = err.message || err.toString();
            createAppLog(result, 'getMysqlConnection');
            callback(err, null);
        } else {
            callback(null, connection);
        }
    });
};

module.exports = { getMysqlConnection, createAppLog };
