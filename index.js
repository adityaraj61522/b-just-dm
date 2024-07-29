const express = require("express");
const app = express();
const dbConnection = require("./config/dbConnection");
const port = process.env.PORT || 7000;
const http = require("http");
const socketIo = require('socket.io');
require("./routes/routes")(app);
const cors = require("cors");
const server = http.createServer(app);
const io = socketIo(server);
const clients = new Set();
// CORS configuration options
const corsOptions = {
  origin: "http://localhost:8000", // Replace with your Flutter web app's URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  optionsSuccessStatus: 200,
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));

app.all("/", [require("./routes/routes")]);

app.all("/*", function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

app.get("/api", (req, res) => {
  res.status(200).json({
    message: "success"
  });
});

// io.on('connection', (socket) => {
//   clients.add(socket.id);
//   console.log('New client connected:', socket.id);
//   socket.emit('testEvent', 'Hello from server');

//   socket.on('sendMessage', (message) => {
//     console.log("messgae received")
//     const { sender, receiver, text } = message;
//     const query = 'INSERT INTO messages (sender, receiver, text) VALUES (?, ?, ?)';
//     db.query(query, [sender, receiver, text], (err, result) => {
//       if (err) {
//         console.error('Failed to insert message:', err.stack);
//         return;
//       }
//       io.emit('receiveMessage', message);
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// function checkActiveConnections() {
//   console.log(`Active connections: ${clients.size}`);
// }

// // Call checkActiveConnections periodically or based on your needs
// setInterval(checkActiveConnections, 10000);

// const server = require("http").createServer(app);
// const io = require("socket.io")(server, {
//   cors: {
//     origin: "http://localhost:8000",
//     credentials: true,
//   },
// });

// io.on("connection", (socket) => {
//   // For dating Chat

//   socket.on("join", async ({ senderId, receiverId, mutualId }) => {
//     var newRoom = new ChatRoom({
//       name: senderId + receiverId,
//       members: [senderId, receiverId],
//       maxCapacity: 2,
//     });
//     await newRoom.save();
//     var mutual = await MutualProfiles.updateOne(
//       { _id: mutualId },
//       {
//         roomId: newRoom._id,
//       }
//     );
//     io.emit("joined", newRoom._id);
//   });

//   socket.on("message", async ({ message, roomId, userId }) => {
//     var message = new Message({
//       message: message,
//       userId: userId,
//       roomId: roomId,
//     });
//     await message.save();
//     let messages = await Message.find({ roomId: roomId }).populate("userId");
//     io.emit("messageSent", messages);
//     io.emit("notification", message);
//   });

//   // For Common chat

//   socket.on("joinRoom", async ({ userId, currentUser }) => {
//     const chatRoom = new CommonChatRoom({
//       user1: userId,
//       user2: currentUser,
//     });
//     await chatRoom.save();
//     io.emit("joinedRoom", chatRoom._id);
//   });
//   socket.on("commonmessage", async ({ id, roomId, chat }) => {
//     var message = new Chat({
//       user: id,
//       roomId: roomId,
//       message: chat,
//     });
//     await message.save();

//     let Chats = await Chat.find({ roomId: roomId }).populate("user");
//     io.emit("commonmessageSent", Chats);
//   });

//   // For Group Chat

//   socket.on("creategroup", async ({ selectedUsers, groupName }) => {
//     console.log(selectedUsers);
//     let newGroup = new Group({
//       members: selectedUsers,
//       name: groupName,
//     });

//     await newGroup.save();
//     if (!newGroup) return res.json("Problem in creating Group");
//     // res.json(newGroup);
//     io.emit("groupcreated", newGroup);
//   });
//   socket.on("groupmessage", async ({ id, groupId, chat }) => {
//     var groupMessage = new GroupChat({
//       user: id,
//       roomId: groupId,
//       message: chat,
//     });
//     await groupMessage.save();

//     let Chats = await GroupChat.find({ roomId: groupId }).populate("user");
//     io.emit("groupmessageSent", Chats);
//   });
// });
// io.on("connection", (socket) => {
//   // console.log("hiiii");

//   socket.on("Input Chat Message", (msg) => {
//     connectToDatabase().then((db) => {
//       try {
//         let chat = new Chat({
//           message: msg.chatMessage,
//           sender: msg.userId,
//           receiver: msg.receiverID,
//           type: msg.type,
//           read: msg.read,
//         });
//         chat.save((err, doc) => {
//           console.log(doc);
//           if (err) return res.json({ success: false, err });
//           Chat.find({ _id: doc._id })
//             .populate("sender")
//             .exec((err, doc) => {
//               return io.emit("Output Chat Message", doc);
//             });
//         });
//       } catch (error) {
//         console.error(error);
//       }
//     });
//   });
// });


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});