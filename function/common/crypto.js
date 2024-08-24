const cryptoJS = require('crypto-js');

// const key = "8CA7EDFF774E1C23C192875D16853";

// // Function to encrypt any text (e.g., user ID)
// function encrypt(text) {
//     try {
//         return CryptoJS.AES.encrypt(text.toString(), key).toString();
//     } catch (e) {
//         console.log("error============== " + e);
//     }

// }

// // Function to decrypt any encrypted text
// function decrypt(encryptedText) {
//     return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
// }

var key = cryptoJS.enc.Base64.parse("6Le0DgMTAAAAANokdEEial");
var iv = cryptoJS.enc.Base64.parse("mHGFxENnZLbienLyANoi.e");

function encrypt(message) {
    var encrypted = cryptoJS.AES.encrypt(message.toString(), key, {
        iv: iv
    });
    encrypted = encrypted.toString();
    return encrypted.replace(/\+/g, 'p1L2u3S').replace(/\//g, 's1L2a3S4h').replace(/=/g, 'e1Q2u3A4l');
}

function decrypt(message) {
    message = message.toString();
    message = message.replace(/p1L2u3S/g, '+').replace(/s1L2a3S4h/g, '/').replace(/e1Q2u3A4l/g, '=');
    var decrypted = cryptoJS.AES.decrypt(message.toString(), key, {
        iv: iv
    });
    return decrypted.toString(cryptoJS.enc.Utf8);
}
module.exports = {
    encrypt,
    decrypt,
};