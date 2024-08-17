const axios = require('axios');
const db = require("../../config/dbConnection");
const crypto = require('../common/crypto')

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

exports.payToUnlockChat = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let getRoomQuery = `select * from linket_chat_room where room_id = ${crypto.decrypt(request.headers.roomid)}`;
            console.log('getRoomQuery ============ ' + getRoomQuery);
            const getRoomQueryRes = await db.executeQuery(getRoomQuery);
            if (!getRoomQueryRes) throw {
                status: "FAILURE"
            };
            let receiversId = 0;
            if (getRoomQueryRes && getRoomQueryRes.length > 0) {
                if (getRoomQueryRes[0].participant_1 = request.headers.userDetails.user_id) {
                    receiversId = getRoomQueryRes[0].participant_2;
                } else if (getRoomQueryRes[0].participant_2 = request.headers.userDetails.user_id) {
                    receiversId = getRoomQueryRes[0].participant_1;
                }
            }
            let getParticipantQuery = `select * from linket_user where user_id = ${receiversId}`;
            console.log('getParticipantQuery ============ ' + getParticipantQuery);
            const getParticipantQueryRes = await db.executeQuery(getParticipantQuery);
            if (!getParticipantQueryRes) throw {
                status: "FAILURE"
            };
            let payingAmount = 0;
            if (getParticipantQueryRes && getParticipantQueryRes.length > 0 && getParticipantQueryRes[0].rate) {
                payingAmount = getParticipantQueryRes[0].rate;
            }
            if (payingAmount > request.headers.userDetails.balance) {
                throw {
                    status: "FAILURE"
                }
            }
            let updatePayerQuery = `Update linket_user Set balance = ${request.headers.userDetails.balance - payingAmount} where user_id = ${request.headers.userDetails.user_id}`;
            let updateReceiverQuery = `Update linket_user Set balance = ${getParticipantQueryRes[0].balance - payingAmount} where user_id = ${getParticipantQueryRes[0].user_id}`;
            let insertTransactionQuery = `Insert Into linket_room_transaction (room_id,amount,payer_id,receiver_id) Values (${crypto.decrypt(request.headers.roomid)},${payingAmount}, ${request.headers.userDetails.user_id},${getParticipantQueryRes[0].user_id})`;
            let unlockChatQuery = `update linket_chat_room set is_paid = 1 where room_id = ${crypto.decrypt(request.headers.roomid)}`;
            const transactionRes = await db.executeTransaction([updatePayerQuery, updateReceiverQuery, insertTransactionQuery, unlockChatQuery]);
            if (!transactionRes) throw {
                status: "FAILURE"
            };
            console.log(transactionRes);
            resolve({
                status: "SUCCESS",
            });
        } catch (e) {
            reject({
                status: "FAILURE",
                message: "Error while getting payToUnlockChat error  = " + e
            })
        }
    });
}