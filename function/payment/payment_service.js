const axios = require('axios');
const db = require("../../config/dbConnection");

exports.addBalance = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let updatedBalance = Number(request.headers.userDetails.balance) + Number(request.headers.amount);
            let addBalanceQuery = `UPDATE linket_user SET balance = ${updatedBalance} where user_id = ${request.headers.userDetails.user_id}`;
            console.log('addBalanceQuery ============ ' + addBalanceQuery);
            const queryRes = await db.executeQuery(addBalanceQuery);
            if (!queryRes) throw {
                status: "FAILURE"
            };
            console.log(queryRes);
            resolve({
                status: "SUCCESS",
                data: queryRes,
            });
        } catch (e) {
            reject({
                status: "FAILURE",
                message: "Error while getting addBalance error  = " + e
            })
        }
    });
}

exports.withdrawBalance = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let updatedBalance = Number(request.headers.userDetails.balance) - Number(request.headers.amount);
            let withdrawBalanceQuery = `UPDATE linket_user SET balance = ${updatedBalance} where user_id = ${request.headers.userDetails.user_id}`;
            console.log('withdrawBalanceQuery ============ ' + withdrawBalanceQuery);
            const queryRes = await db.executeQuery(withdrawBalanceQuery);
            if (!queryRes) throw {
                status: "FAILURE"
            };
            console.log(queryRes);
            resolve({
                status: "SUCCESS",
                data: queryRes,
            });
        } catch (e) {
            reject({
                status: "FAILURE",
                message: "Error while getting withdrawBalance error  = " + e
            })
        }
    });
}