const axios = require("axios");
const qs = require("qs");
const dotenv = require("dotenv");
const db = require("../../config/dbConnection");
const jwt = require("jsonwebtoken");
const chatService = require('./chat_service');
const crypto = require('../common/crypto')

dotenv.config();

const handleError = (functionName, e, response) => {
    console.log(`Error inside ${functionName}------------------`, e);
    response.status(500).send({
        code: e.code ? e.code : 201,
        status: e.status ? e.status : "FAILURE",
        description: "Something went wrong!!!",
        message: `Error inside ${functionName}!!!`,
    });
};

exports.setRate = async function (request, response) {
    try {
        if (!request.headers.rate) {
            throw {
                code: 400,
                status: "BAD_REQUEST"
            };
        }
        let setRateRes = await chatService.setRate(request.headers.userDetails.user_id, request.headers.rate);
        if (!setRateRes) {
            throw {
                status: "FAILURE",
                error: setRateRes
            };
        }
        response.status(200).send({
            code: 200,
            status: "SUCCESS"
        });
    } catch (e) {
        handleError('setRate', e, response);
    }
};

exports.getChatList = async function (request, response) {
    try {
        if (!request.headers.userDetails.user_id) {
            throw {
                code: 400,
                status: "BAD_REQUEST"
            };
        }
        let chatList = await chatService.getChatList(request.headers.userDetails.user_id);
        if (!chatList || chatList.status !== "SUCCESS" || !chatList.data || chatList.data.length < 1) {
            throw {
                status: "FAILURE",
                error: chatList
            };
        }
        for (let chat of chatList.data) {
            chat.roomId = crypto.encrypt(chat.roomId);
            chat.userId = crypto.encrypt(chat.userId);
        }
        response.status(200).send({
            code: 200,
            status: "SUCCESS",
            data: chatList.data
        });
    } catch (e) {
        handleError('getChatList', e, response);
    }
};

exports.getChatsByRoomId = async function (request, response) {
    try {
        if (!request.headers.roomid) {
            throw {
                code: 400,
                status: "BAD_REQUEST"
            };
        }
        let chatList = await chatService.getChatsByUserId(crypto.decrypt(request.headers.roomid), request.headers.userDetails.user_id);
        if (!chatList || chatList.status !== "SUCCESS" || !chatList.data || chatList.data.length < 1) {
            throw {
                status: "FAILURE",
                error: chatList
            };
        }
        for (let chat of chatList.data) {
            chat.sent = chat.sent === 'Y' ? true : false;
            chat.sender_id = crypto.encrypt(chat.sender_id);
            chat.receiver_id = crypto.encrypt(chat.receiver_id);

        }
        response.status(200).send({
            code: 200,
            status: "SUCCESS",
            data: chatList.data
        });
    } catch (e) {
        handleError('getChatsByUserId', e, response);
    }
};