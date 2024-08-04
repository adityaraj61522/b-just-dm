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
const allowedOrigins = ["http://localhost:8000", "https://linket.chat"];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "*",
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigins.join(', '));
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});


socketHandler(io);

// Use CORS middleware with specified options

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