const axios = require('axios');
const chatService = require('./chat_router');
const db = require("../../config/dbConnection");

exports.setRate = function (forUserId, rate) {
    return new Promise(async (resolve, reject) => {
        try {
            let setRateQuery = `UPDATE linket_user SET rate = ${rate} where user_id = ${forUserId}`;
            console.log('setRateQuery ============ ' + setRateQuery);
            const queryRes = await db.executeQuery(setRateQuery);
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
                message: "Error while getting setRate error  = " + e
            })
        }
    });
}

exports.getChatList = function (forUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let getChatQuery = `SELECT
                                lcr.room_id as roomId,
                                lcr.is_paid as isPaid,
                                lu.user_id as userId,
                                lu.name,
                                lu.user_name as userName,
                                lu.picture_url as picture,
                                lu.rate,
                                lc.chat_text as chatText,
                                lc.chat_img as chatImg,
                                DATE_FORMAT(lc.chat_date, '%d %b %y %l:%i %p') as chatDate,
                                COUNT(lc2.chat_id) as unreadCount
                            FROM
                                linket_chat_room lcr
                            INNER JOIN linket_user lu
                                ON
                                lu.user_id != ${forUserId}
                                AND (lu.user_id = lcr.participant_1
                                    OR lu.user_id = lcr.participant_2)
                            LEFT JOIN linket_chat lc
                                ON
                                lc.room_id = lcr.room_id
                                AND lc.chat_date = (
                                SELECT
                                    MAX(chat_date)
                                FROM
                                    linket_chat lc2
                                WHERE
                                    lc2.room_id = lc.room_id
                                )
                            LEFT JOIN linket_chat lc2 ON
                                lc2.room_id = lcr.room_id
                                AND lc2.chat_read = 0
                                AND lc2.receiver_id = ${forUserId}
                            WHERE
                                (lcr.participant_1 = ${forUserId}
                                    OR lcr.participant_2 = ${forUserId})
                            GROUP BY
                                lcr.room_id
                            ORDER BY
                                lc.chat_date DESC,
                                lcr.room_creation_date DESC`;
            console.log('getChatQuery ============ ' + getChatQuery);
            const queryRes = await db.executeQuery(getChatQuery);
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
                message: "Error while getting getChatList error  = " + e
            })
        }
    });
}


exports.getChatsByUserId = function (roomId, forUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let getChatQuery = `SELECT
                                jdc.sender_id,
                                jdc.receiver_id,
                                jdc.chat_text as chatText,
                                jdc.chat_img as chatImg,
                                DATE_FORMAT(jdc.chat_date, '%d %b %y %l:%i %p') as chatDate,
                                CASE
                                    WHEN jdc.sender_id = ${forUserId} THEN 'Y'
                                    ELSE 'N'
                                END as sent
                            FROM
                                linket_chat jdc
                            WHERE jdc.room_id = ${Number(roomId)}
                            ORDER BY
                                jdc.chat_date;`;
            console.log('getChatQuery ============ ' + getChatQuery);
            const queryRes = await db.executeQuery(getChatQuery);
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
                message: "Error while getting getChatsByUserId error  = " + e
            })
        }
    });
}


exports.newRoomCreation = function (request, chatWith) {
    return new Promise(async (resolve, reject) => {
        try {
            let userExistenceQuery = `SELECT * from linket_user where user_name = '${chatWith}'`;
            console.log('userExistenceQuery ============ ' + userExistenceQuery);
            const userExistenceQueryRes = await db.executeQuery(userExistenceQuery);
            if (!userExistenceQueryRes) {
                throw {
                    status: "FAILURE"
                }
            } else if (userExistenceQueryRes && userExistenceQueryRes.length < 1) {
                console.error("The requested chat with user doesn't exist!!!!");
                resolve({
                    status: "USER_NOT_EXIST",
                    message: "The requested chat with user doesn't exist!!!!"
                });
            } else {
                let roomExistenceQuery = `SELECT * FROM linket_chat_room lcr INNER JOIN linket_user lu ON lu.user_name= '${chatWith}' WHERE (lcr.participant_1=lu.user_id OR lcr.participant_2=lu.user_id) AND (lcr.participant_1=${request.headers.userDetails.user_id} OR lcr.participant_2=${request.headers.userDetails.user_id})`
                const roomExistenceQueryRes = await db.executeQuery(roomExistenceQuery);
                if (!roomExistenceQueryRes) {
                    throw {
                        status: "FAILURE"
                    }
                } else if (roomExistenceQueryRes && roomExistenceQueryRes.length < 1) {
                    let createChatRoomQuery = "INSERT INTO linket_chat_room (participant_1,participant_2) VALUES (?,?)"
                    let insertParams = [request.headers.userDetails.user_id, userExistenceQueryRes[0].user_id];
                    const createChatRoomQueryRes = await db.executeQuery(createChatRoomQuery, insertParams);
                    if (!createChatRoomQueryRes) {
                        throw {
                            status: "FAILURE"
                        }
                    } else {
                        console.log("The requested chat room was created!!!!");
                        resolve({
                            status: "ROOM_CREATED_SUCCESSFULLY",
                            message: "The requested chat room was created!!!!"
                        });
                    }
                } else {
                    resolve({
                        status: "CHAT_ROOM_EXISTS",
                        message: "Room Already Exists!!!!"
                    });
                    return;
                }
            }
            console.log(queryRes);
            resolve({
                status: "SUCCESS",
                data: queryRes,
            });
        } catch (e) {
            reject({
                status: "FAILURE",
                message: "Error while newRoomCreation error  = " + e
            })
        }
    });
}