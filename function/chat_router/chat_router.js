const axios = require("axios");
const qs = require("qs");
const dotenv = require("dotenv");
const db = require("../../config/dbConnection");
const jwt = require("jsonwebtoken");
// const sessionService = require("./session_service");
const chatService = require('./chat_service');

dotenv.config();

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

const SCOPE = "openid profile email";
const AUTH_URL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const PROFILE_URL = "https://api.linkedin.com/v2/userinfo";


exports.getChatList = async function (request, response) {
    try {
        // let verifySession = await  commonService.verifySession(request.headers.token);
        // if(!verifySession || !verifySession.status ||  verifySession.status !== 'SUCCESS'){
        //     response.status(401).send({
        //         code:"EC401",
        //         status: "FAILURE",
        //         description: "Invalid session token!!!",
        //         message: "Error inside getChatMessages!!!",
        //     })
        // }
        if (!request.headers.userid) {
            throw ({
                code: 400,
                status: "BAD_REQUEST"
            })
        }
        let chatList = await chatService.getChatList(request.headers.userid);
        if (!chatList || !chatList.status || chatList.status != "SUCCESS" || !chatList.data || chatList.data.length < 1) {
            throw ({
                status: "FAILURE",
                error: chatList
            })
        }
        response.status(200).send({
            code: 200,
            status: "SUCCESS",
            data: chatList.data
        })
    } catch (e) {
        console.log("Error inside getChatList------------------  " + e);
        response.status(500).send({
            code: e.code ? e.code : 201,
            status: e.status ? e.status : "FAILURE",
            description: "Something went wrong!!!",
            message: "Error inside getChatList!!!",
        })
    }
}


exports.getChatsByUserId = async function (request, response) {
    try {
        // let verifySession = await  commonService.verifySession(request.headers.token);
        // if(!verifySession || !verifySession.status ||  verifySession.status !== 'SUCCESS'){
        //     response.status(401).send({
        //         code:"EC401",
        //         status: "FAILURE",
        //         description: "Invalid session token!!!",
        //         message: "Error inside getChatMessages!!!",
        //     })
        // }
        if (!request.headers.userid) {
            throw ({
                code: 400,
                status: "BAD_REQUEST"
            })
        }
        let chatList = await chatService.getChatsByUserId(request.headers.userid);
        if (!chatList || !chatList.status || chatList.status != "SUCCESS" || !chatList.data || chatList.data.length < 1) {
            throw ({
                status: "FAILURE",
                error: chatList
            })
        }
        response.status(200).send({
            code: 200,
            status: "SUCCESS",
            data: chatList.data
        })
    } catch (e) {
        console.log("Error inside getChatsByUserId------------------  " + e);
        response.status(500).send({
            code: e.code ? e.code : 201,
            status: e.status ? e.status : "FAILURE",
            description: "Something went wrong!!!",
            message: "Error inside getChatsByUserId!!!",
        })
    }
}