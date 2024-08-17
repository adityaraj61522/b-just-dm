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


exports.executeTransaction = async function (queryList, paramsList) {
    return new Promise(async (resolve, reject) => {
        const connection = await pool.getConnection();
        try {
            console.log('Database connection established successfully.');
            try {
                await connection.beginTransaction();
            } catch (beginTransactionError) {
                console.error('Error starting transaction:', beginTransactionError);
                connection.release();
                return reject({
                    status: "FAILURE",
                    message: `Failed while beginning transaction ${beginTransactionError}`
                });
            }
            for (let i = 0; i < queryList.length; i++) {
                const query = queryList[i];
                const params = [];
                if (paramsList && paramsList.length >= i) {
                    params = paramsList[i];
                }
                try {
                    const [results, fields] = await connection.execute(query, params);
                    console.log('Query executed successfully:', results);
                } catch (queryError) {
                    console.error('Error executing query:', queryError);
                    try {
                        await connection.rollback();
                    } catch (rollbackError) {
                        console.error('Error during rollback:', rollbackError);
                    }
                    connection.release();
                    return reject({
                        status: "FAILURE",
                        message: `Failed while beginning transaction ${queryError}`
                    });
                }
            }
            try {
                await connection.commit();
                console.log('Transaction committed successfully.');
                resolve({
                    status: "SUCCESS"
                });
            } catch (commitError) {
                console.error('Error committing transaction:', commitError);
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.error('Error during rollback after commit failure:', rollbackError);
                }
                connection.release();
                reject({
                    status: "FAILURE",
                    message: `Failed while committing transaction ${commitError}`
                });
            }

        } catch (connectionError) {
            console.error('Error establishing database connection:', connectionError);
            reject({
                status: "FAILURE",
                message: `Failed while getting connection for transaction ${connectionError}`
            });

        } finally {
            if (!connection._pool) {
                connection.release();
                console.log('Database connection released.');
            }
        }
    });
};