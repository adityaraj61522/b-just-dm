const axios = require("axios");
const qs = require("qs");
const dotenv = require("dotenv");
const db = require("../../config/dbConnection");
const jwt = require("jsonwebtoken");

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

exports.getSessionToken = async function (profileData, isAuthenticated) {
  return new Promise((resolve, reject) => {
    try {
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 10,
          data: profileData,
        },
        JWT_SECRET_KEY
      );
      if (!token) throw { status: "FAILURE" };
      isAuthenticated = true;
      resolve({ token: token, isAuthenticated: isAuthenticated });
    } catch (e) {
      console.log("Error while getting JWT token" + e);
      reject({ status: "FAILURE", error: e, isAuthenticated: isAuthenticated });
    }
  });
};
