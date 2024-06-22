// script.js
const socket = io();
let currentPlayer;
let myTurn = false;
let roomId;

// Cell click handler
document.querySelectorAll('.cell').forEach((cell, index) => {
    cell.addEventListener('click', () => {
        if (myTurn && !cell.textContent) {
            cell.textContent = currentPlayer;
            socket.emit('move', { roomId, index, currentPlayer });
            myTurn = false;
        }
    });
});

// Play button handler
document.getElementById('playButton').addEventListener('click', () => {
    document.querySelector('.cover').classList.add('hidden');
    document.querySelector('.board').classList.remove('hidden');
    roomId = prompt('Enter game room ID:');
    socket.emit('joinGame', roomId);
});

// Handle game start
socket.on('startGame', ({ currentPlayer: player }) => {
    currentPlayer = player;
    myTurn = currentPlayer === 'X';
});

// Handle opponent's move
socket.on('move', ({ index, currentPlayer: player }) => {
    document.getElementById(`cell-${index}`).textContent = player;
    myTurn = player !== currentPlayer;
});

// Handle room full
socket.on('roomFull', () => {
    alert('Game room is full. Please try another room.');
    location.reload();
});

// Handle opponent left
socket.on('playerLeft', () => {
    alert('Your opponent has left the game.');
    location.reload();
});
