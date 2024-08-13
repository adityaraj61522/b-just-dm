const CryptoJS = require('crypto-js');

const key = "8CA7EDFF774E1C23C192875D16853";

// Function to encrypt any text (e.g., user ID)
function encrypt(text) {
    try {
        return CryptoJS.AES.encrypt(text.toString(), key).toString();
    } catch (e) {
        console.log("error============== " + e);
    }

}

// Function to decrypt any encrypted text
function decrypt(encryptedText) {
    return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
}

module.exports = {
    encrypt,
    decrypt,
};