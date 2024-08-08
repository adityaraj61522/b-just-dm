const axios = require("axios");
const qs = require("qs");
const dotenv = require("dotenv");
const db = require("../../config/dbConnection");
const jwt = require("jsonwebtoken");
const chatService = require('./chat_service');

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
        let setRateRes = await chatService.setRate(request.headers.userid, request.headers.rate);
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
        if (!request.headers.userid) {
            throw {
                code: 400,
                status: "BAD_REQUEST"
            };
        }
        let chatList = await chatService.getChatList(request.headers.userid);
        if (!chatList || chatList.status !== "SUCCESS" || !chatList.data || chatList.data.length < 1) {
            throw {
                status: "FAILURE",
                error: chatList
            };
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

exports.getChatsByUserId = async function (request, response) {
    try {
        if (!request.headers.userid || !request.headers.roomid) {
            throw {
                code: 400,
                status: "BAD_REQUEST"
            };
        }
        let chatList = await chatService.getChatsByUserId(request.headers.roomid, request.headers.userid);
        if (!chatList || chatList.status !== "SUCCESS" || !chatList.data || chatList.data.length < 1) {
            throw {
                status: "FAILURE",
                error: chatList
            };
        }
        for (let chat of chatList.data) {
            chat.sent = chat.sent === 'Y' ? true : false
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