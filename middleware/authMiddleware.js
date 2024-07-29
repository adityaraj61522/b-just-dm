const jwt = require('jsonwebtoken');
const {
    promisify
} = require('util');
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const verifyToken = promisify(jwt.verify); // Convert jwt.verify to return a promise

const authMiddleware = async (req, res, next) => {
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
            const decoded = await verifyToken(token, JWT_SECRET_KEY); // Replace 'your_secret_key' with your actual secret key
            req.body.user = decoded; // Attach decoded token data to request object
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

module.exports = authMiddleware;