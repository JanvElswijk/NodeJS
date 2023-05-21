const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_DATABASE || 'ShareAMeal',
    port: process.env.DB_PORT || 3306,
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 5, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 6000000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0
});
const query = (sql, params, callback) => {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err);
            return;
        }

        connection.query(sql, params, (err, rows) => {
            if (err) {
                callback(err);
            } else {
                callback(null, rows);
            }
        });
        connection.release();
    });
};

module.exports = {
    query
}
