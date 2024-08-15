const axios = require("axios");
const qs = require("qs");
const dotenv = require("dotenv");
const db = require("../../config/dbConnection");
const jwt = require("jsonwebtoken");
const paymentService = require('./payment_service');
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

exports.addBalance = async function (request, response) {
    try {
        if (!request.headers.amount) {
            throw {
                code: 400,
                status: "BAD_REQUEST"
            };
        }
        let addBalanceRes = await paymentService.addBalance(request);
        if (!addBalanceRes) {
            throw {
                status: "FAILURE",
                error: addBalanceRes
            };
        }
        response.status(200).send({
            code: 200,
            status: "SUCCESS"
        });
    } catch (e) {
        handleError('addBalance', e, response);
    }
};

exports.withdrawBalance = async function (request, response) {
    try {
        if (!request.headers.amount) {
            throw {
                code: 400,
                status: "BAD_REQUEST"
            };
        }
        let withdrawBalanceRes = await paymentService.withdrawBalance(request);
        if (!withdrawBalanceRes) {
            throw {
                status: "FAILURE",
                error: withdrawBalanceRes
            };
        }
        response.status(200).send({
            code: 200,
            status: "SUCCESS"
        });
    } catch (e) {
        handleError('addBalance', e, response);
    }
};