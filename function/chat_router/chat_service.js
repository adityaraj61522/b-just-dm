const axios = require('axios');
const chatService = require('./chat_router');
const db = require("../../config/dbConnection");

exports.getChatList = function (forUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let getChatQuery = `select
                                jdcr.room_id as roomId,
                                jdu.user_id as userId,
                                jdu.name,
                                jdc.chat_text as chatText,
                                jdc.chat_img as chatImg,
                                jdc.chat_date as chatDate
                            from
                                just_dm_chat jdc
                            inner join just_dm_user jdu on
                                jdu.user_id = jdc.sender_id
                                and jdu.user_id != ${forUserId}
                            inner join just_dm_chat_room jdcr on
                                (jdcr.participant_1 = ${forUserId} or jdcr.participant_2 = ${forUserId})
                            inner join (
                                select
                                    jdc.sender_id,
                                    max(jdc.chat_date) as max_chat_date
                                from
                                    just_dm_chat jdc
                                where
                                    jdc.receiver_id = ${forUserId} or jdc.sender_id = ${forUserId}
                                group by
                                    jdc.sender_id
                            ) latest_chat on
                                jdc.sender_id = latest_chat.sender_id
                                and jdc.chat_date = latest_chat.max_chat_date
                            where
                                jdc.room_id = jdcr.room_id
                            group by
                                jdcr.room_id, jdu.user_id, jdu.name, jdc.chat_text, jdc.chat_img, jdc.chat_date;`;
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


exports.getChatsByUserId = function (forUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let getChatQuery = `SELECT
                                jdc.sender_id,
                                jdc.receiver_id,
                                jdc.chat_text as chatText,
                                DATE_FORMAT(jdc.chat_date, '%d %b %y %l:%i %p') as date,
                                CASE
                                    WHEN jdc.sender_id = ${forUserId} THEN 'Y'
                                    ELSE 'N'
                                END as sent
                            FROM
                                just_dm_chat jdc
                            INNER JOIN just_dm_chat_room jdcr ON
                                jdcr.room_id = jdc.room_id
                                AND (jdcr.participant_1 = ${forUserId} OR jdcr.participant_2 = ${forUserId})
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