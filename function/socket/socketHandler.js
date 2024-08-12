const clients = new Set();
const db = require("../../config/dbConnection");
const crypto = require("../common/crypto")


module.exports = (io) => {
    io.on('connection', (socket) => {
        clients.add(socket.id);
        console.log('New client connected:', socket.id);

        socket.on('joinRoom', async (roomInfo) => {
            socket.join(roomInfo.roomId);
            console.log(`Client ${socket.id} joined room ${roomInfo.roomId}`);
            const {
                roomId,
                senderId,
                receiverId
            } = roomInfo;
            const chatObj = {
                roomId: crypto.decrypt(roomId),
                senderId: crypto.decrypt(senderId),
                receiverId: crypto.decrypt(receiverId)
            };
            let markRead = await markAsRead(chatObj);
            if (!markRead || markRead.status !== 'SUCCESS') {
                console.error('Failed to insert message:', markRead);
                return;
            };
        });

        socket.on('sendMessage', async (message) => {
            console.log("Message received:", message);
            const {
                roomId,
                senderId,
                receiverId,
                chatText,
                chatImg
            } = message;
            const chatObj = {
                roomId: crypto.decrypt(roomId),
                senderId: crypto.decrypt(senderId),
                receiverId: crypto.decrypt(receiverId),
                chatText: chatText,
                chatImg: chatImg
            };
            let saveChatMessage = await saveChat(chatObj);
            if (!saveChatMessage || saveChatMessage.status !== 'SUCCESS') {
                console.error('Failed to insert message:', saveChatMessage);
                return;
            };
            io.to(roomId).emit('receiveMessage', message);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

async function saveChat(chatObj) {
    return new Promise(async (resolve, reject) => {
        try {
            chatObj.chatImg = chatObj.chatImg ? chatObj.chatImg : 'null';
            const saveChatQuery = `INSERT INTO linket_chat (room_id, sender_id, receiver_id, chat_text, chat_img) VALUES (${chatObj.roomId}, ${chatObj.senderId}, ${chatObj.receiverId}, '${chatObj.chatText}', ${chatObj.chatImg})`;
            const queryRes = await db.executeQuery(saveChatQuery);
            if (!queryRes) {
                console.error('Failed to insert message:', err.stack);
                throw ({
                    status: "FAILURE"
                })
            };
            resolve({
                status: "SUCCESS"
            });
        } catch (e) {
            resolve({
                status: "FAILURE",
                message: "ERROR while saving chat to DB:- " + e
            });
        }
    });
}

async function markAsRead(chatObj) {
    return new Promise(async (resolve, reject) => {
        try {
            const markAsReadQuery = `update linket_chat set chat_read = 1 where room_id = ${chatObj.roomId} and sender_id = ${chatObj.senderId} and receiver_id =${chatObj.receiverId}`;
            const queryRes = await db.executeQuery(markAsReadQuery);
            if (!queryRes) {
                console.error('Failed to markAsRead message:', err.stack);
                throw ({
                    status: "FAILURE"
                })
            };
            resolve({
                status: "SUCCESS"
            });
        } catch (e) {
            resolve({
                status: "FAILURE",
                message: "ERROR while markAsRead chat to DB:- " + e
            });
        }
    });
}