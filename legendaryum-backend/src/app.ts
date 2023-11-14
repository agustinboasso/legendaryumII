import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { MetaverseService } from './services/service';
import { apiRoutes } from './routes/apiRoutes';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const metaverseService = new MetaverseService();
metaverseService.startCoinGenerationTimer();

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
  socket.on('joinRoom', (room) => {
    socket.join(room);
    const coins = metaverseService.getCoinsInRoom(room);
    io.to(socket.id).emit('coinsInRoom', coins);
  });

  socket.on('grabCoin', (coinId) => {
    metaverseService.removeCoin(coinId);
    io.to(socket.id).emit('coinGrabbed', coinId);
    socket.broadcast.to(socket.rooms.values().next().value).emit('coinGrabbed', coinId);
  });
});

app.use('/api', apiRoutes(metaverseService));
app.use(cors());

server.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
