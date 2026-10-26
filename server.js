const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Временное хранилище (в памяти). 
// Если сервер перезагрузится, история чата очистится.
let chatHistory = [];

io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  // Отправляем историю чата новому пользователю
  socket.emit('chat_history', chatHistory);

  // Принимаем новое сообщение
  socket.on('send_message', (data) => {
    chatHistory.push(data);
    
    // Ограничиваем историю 100 последними сообщениями, чтобы не забивать память
    if (chatHistory.length > 100) chatHistory.shift();

    // Рассылаем сообщение всем подключенным
    io.emit('new_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

// ОБЯЗАТЕЛЬНО ДЛЯ ХОСТИНГА: слушаем порт, который выдал SpaceWeb
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});