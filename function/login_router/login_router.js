const axios = require("axios");
const qs = require("qs");
const dotenv = require("dotenv");
const db = require("../../config/dbConnection");
const jwt = require("jsonwebtoken");
const sessionService = require("./session_service");

dotenv.config();

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

const SCOPE = "openid profile email";
const AUTH_URL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const PROFILE_URL = "https://api.linkedin.com/v2/userinfo";

// Step 1: Redirect user to LinkedIn for authentication
exports.loginViaLinkdin = function (req, res) {
  res.send(200, {code:200, status:"SUCCESS", location: AUTH_URL });
};

// Step 2: Handle the callback from LinkedIn
exports.loginViaLinkdinCallback = async function (req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No code returned from LinkedIn");
  }
  let isAuthenticated = false;
  try {
    // Step 3: Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      TOKEN_URL,
      qs.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 4: Use the access token to fetch the user's profile data
    const profileResponse = await axios.get(PROFILE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profileData = profileResponse.data;

    if (profileData && profileData.sub) {
      let userExists = await checkUserProfileSub(profileData);
      if (!userExists || userExists.status === "FAILURE")
        throw { status: "FAILURE" };
      if (userExists && !userExists.userExists) {
        let insertUser = await insertUserToDb(profileData);
        if (!insertUser || insertUser.status === "FAILURE")
          throw { status: "FAILURE" };
        console.log("user inserted successfully");
      }
    }
    let sessionToken = await sessionService.getSessionToken(
      profileData,
      isAuthenticated
    );
    res.redirect("http://localhost:8000/#/getLinkdinUser/" + sessionToken.token);
    // res.status(200).send({
    //   status: "SUCCESS",
    //   sessionToken: sessionToken,
    //   message: "User authenticated and data stored successfully",
    //   isAuthenticated: sessionToken.isAuthenticated,
    // });
  } catch (error) {
    console.error(
      "Error exchanging code for token or fetching profile data:",
      error
    );
    res.status(500).send({
      status: "FAILURE",
      message: "Authentication failed",
      isAuthenticated: isAuthenticated,
    });
  }
};

async function insertUserToDb(profileData) {
  return new Promise(async (resolve, reject) => {
    try {
      const userDataObj = [
        profileData.sub,
        profileData.email_verified ? 1 : 0,
        profileData.name,
        profileData.locale.country,
        profileData.locale.language,
        profileData.given_name,
        profileData.family_name,
        profileData.email,
        profileData.picture,
      ];

      const insertUserQuery = `
      INSERT INTO just_dm_user (
        profile_sub,
        email_verified,
        name,
        locale_country,
        locale_language,
        given_name,
        family_name,
        email,
        picture_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const queryRes = await db.executeQuery(insertUserQuery, userDataObj);
      if (!queryRes) throw { status: "FAILURE" };
      console.log(queryRes);
      resolve({ status: "SUCCESS", message: "user successfully saved to db" });
    } catch (e) {
      console.error("FAILED to insert user to DB" + e);
      reject({ status: "FAILURE" });
    }
  });
}

async function checkUserProfileSub(profileData) {
  return new Promise(async (resolve, reject) => {
    try {
      const insertUserQuery = `SELECT * from just_dm_user where profile_sub  = '${profileData.sub}'`;
      const queryRes = await db.executeQuery(insertUserQuery, []);
      if (!queryRes) throw { status: "FAILURE" };
      console.log(queryRes);
      let userExists = false;
      if (queryRes.length > 0) userExists = true;
      resolve({ status: "SUCCESS", userExists: userExists });
    } catch (e) {
      console.error("FAILED to insert user to DB" + e);
      reject({ status: "FAILURE" });
    }
  });
}

exports.loginViaLinkdinCallback = async function (req, res) {
  try{
    let userData= {};
    jwt.verify(req.headers.token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        // Handle the error (e.g., token expired, invalid signature, etc.)
        console.error('Token verification failed:', err.message);
      } else {
        // Token is valid, decoded contains the payload
        userData=decoded.data;
        console.log(decoded);
      }
    });
    res.status(200).send({
      status: "SUCCESS",
      data: userData,
      message: "User authenticated and data stored successfully",
    });
  } catch (error) {
    console.error(
      "Error exchanging code for token or fetching profile data:",
      error
    );
    res.status(500).send({
      status: "FAILURE",
      message: "Authentication failed",
      isAuthenticated: isAuthenticated,
    });
  }
};
