require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const passport = require("passport");
const initializePassport = require("./config/passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

const users = [];

initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// Socket.io setup
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', socket => {
  console.log('New WS Connection...');

  socket.on('chatMessage', msg => {
    io.emit('message', msg);
  });

  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  socket.on('candidate', (candidate) => {
    socket.broadcast.emit('candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('User has left');
  });
});

// Routes for meetings
const meetingRoutes = require('./routes/meeting');
app.use('/meetings', meetingRoutes);

// Start server
async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
