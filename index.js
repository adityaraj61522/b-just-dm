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
const socketHandler = require('./function/socket/socketHandler')
// CORS configuration options
const corsOptions = {
  origin: '*',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  optionsSuccessStatus: 200,
};

socketHandler(io);

// Use CORS middleware with specified options
app.use(cors(corsOptions));

app.all("/", [require("./routes/routes")]);

app.all("/*", function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "success"
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});