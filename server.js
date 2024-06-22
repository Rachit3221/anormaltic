// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

const rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinGame', (roomId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [] };
        }
        const room = rooms[roomId];
        if (room.players.length < 2) {
            socket.join(roomId);
            room.players.push(socket.id);
            console.log(`User ${socket.id} joined game room ${roomId}`);

            if (room.players.length === 2) {
                io.to(roomId).emit('startGame', { currentPlayer: 'X' });
            }
        } else {
            socket.emit('roomFull');
        }
    });

    socket.on('move', ({ roomId, index, currentPlayer }) => {
        socket.to(roomId).emit('move', { index, currentPlayer });
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const index = room.players.indexOf(socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                io.to(roomId).emit('playerLeft');
                if (room.players.length === 0) {
                    delete rooms[roomId];
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
