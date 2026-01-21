const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // <--- Make sure this is imported
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectMongo, connectMySQL } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const datasetRoutes = require('./routes/datasetRoutes'); // Ensure this is imported

const app = express();
const server = http.createServer(app);

// --- 1. Middleware ---
app.use(express.json());

// FIX: Allow requests from Vite (Port 5173)
app.use(cors({
  origin: "http://localhost:5173", // <--- UPDATE THIS
  credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));

// --- 2. Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);

// Database Connections
connectMongo();
connectMySQL();

// --- 3. Real-Time Socket.io Setup ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // <--- UPDATE THIS TO MATCH FRONTEND
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('cursor_move', (data) => {
    socket.to(data.roomId).emit('cursor_update', data);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});