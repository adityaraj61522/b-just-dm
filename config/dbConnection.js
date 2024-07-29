const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function connectDB() {
    try {
        const connection = await pool.getConnection();
        if (connection) {
            console.log('Database connection established successfully on thread' + connection.threadId);
        } else {
            console.log("Error while getting DB connection===============================");

        }
    } catch (e) {
        console.log("Error while getting DB connection===============================" + e);
        if (e.code === "PROTOCOL_CONNECTION_LOST") {
            console.log("Retrying DB Connection")
            setTimeout(connectDB, 2000);
        } else {
            console.log("Unable to connect to DB")
        }

    }
}


connectDB();

exports.executeQuery = async function (query, params) {
    return new Promise(async (resolve, reject) => {

        try {
            const connection = await pool.getConnection();
            console.log('Database connection established successfully for query ==== ' + query);
            try {
                const [results, fields] = await connection.execute(query, params);
                console.log('Query executed successfully:', results);
                resolve(results);
            } catch (queryError) {
                console.error('Error executing query:', queryError);
                reject(queryError);
            } finally {
                connection.release();
                console.log('Database connection released.');
            }
        } catch (connectionError) {
            console.error('Error establishing database connection:', connectionError);
            reject(connectionError);
        }
    })
}
