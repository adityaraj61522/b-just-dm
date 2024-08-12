const crypto = require('crypto');

// Store the key and IV internally within the module
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // 32 bytes key for aes-256-cbc
const iv = crypto.randomBytes(16); // 16 bytes IV for aes-256-cbc

// Function to encrypt any text (e.g., user ID)
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

// Function to decrypt any encrypted text
function decrypt(encryptedText) {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    if (decrypted && decrypted != '') {
        decrypted += decipher.final('utf8');
    }
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt,
};