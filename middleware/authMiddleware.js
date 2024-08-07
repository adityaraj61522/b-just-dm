const jwt = require('jsonwebtoken');
const {
    promisify
} = require('util');
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

function verifyToken(token, secretOrPublicKey) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretOrPublicKey, (err, decoded) => {
            if (err) {
                reject({
                    isValid: false
                });
            } else {
                resolve({
                    isValid: true,
                    decoded: decoded,
                });
            }
        });
    });
}


exports.authMiddleware = async function (req, res, next) {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send({
                code: "EC401",
                status: "FAILURE",
                description: "Invalid session token!!!",
                message: "Error inside authMiddleware!!!",
            });
        }
        if (token !== process.env.TOKEN_BYPASS_TEXT) {
            const decoded = await verifyToken(token, JWT_SECRET_KEY);
            if (decoded && decoded.isValid && decoded.decoded && decoded.decoded.data) {
                req.headers.userDetails = decoded.decoded.data;
            } else {
                throw ({});
            }
        }
        next();
    } catch (error) {
        return res.status(401).send({
            code: "EC401",
            status: "FAILURE",
            description: "Session expired or invalid token!!!",
            message: "Error inside authMiddleware!!!",
        });
    }
};