const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Глобальная база данных (в памяти сервера)
let globalDB = { 
  users: {}, 
  messages: [] 
};

// API для получения базы при старте
app.get('/api/get-db', (req, res) => {
  res.json(globalDB);
});

// API для обновления базы (например, при начислении денег)
app.post('/api/update-db', (req, res) => {
  globalDB.users = req.body.users;
  io.emit('db_updated', globalDB); // Сообщаем всем, что база обновилась
  res.json({ success: true });
});

io.on('connection', (socket) => {
  // Отправляем историю чата новому пользователю
  socket.emit('chat_history', globalDB.messages);

  // Принимаем новое сообщение
  socket.on('send_message', (data) => {
    globalDB.messages.push(data);
    if (globalDB.messages.length > 100) globalDB.messages.shift();
    io.emit('new_message', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
