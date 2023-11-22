const express = require('express')
const { createServer } = require('node:http');
const { join } = require('node:path');

const db = require('./db')
const bodyParser = require('body-parser')
const expressSanitizer = require('express-sanitizer');
const { Server } = require("socket.io");

const app = express()
const server = createServer(app);
const port = 3001
const socketPort = 4000

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

const WORDS = ["monkey", "dog", "cat", "lion", "tiger", "fish", "seal"];

// key: socket id, value: username
var SocketIdUsernameMap = {};

// Middleware
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.use(expressSanitizer())

// Socket Server
io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);
    emitGameState();

    async function onGuess(msg) {
        console.log('SOCKET MESSAGE: ' + msg);

        var guess = msg; // TODO: sanitize

        let gameState = await db.getGameState(true);
        let secretWord = gameState.word.toString();

        if (!secretWord.localeCompare(guess.toLowerCase())) {
            // Correct answer
            setNewWord();
        }
    }

    async function onDraw(msg) {
        io.emit('DRAW', msg);
    }

    async function onLogin(msg) {
        console.log('SOCKET MESSAGE (DRAW): ' + msg);
        SocketIdUsernameMap[socket.id] = msg;
        console.log(SocketIdUsernameMap);
        db.setPlayers(JSON.stringify(Object.values(SocketIdUsernameMap)));
        emitGameState();
    }

    socket.on('guess', onGuess);
    socket.on('NEWDRAW', onDraw);
    socket.on('LOGIN', onLogin);

    socket.on('disconnect', () => {
        delete SocketIdUsernameMap[socket.id];
        console.log(SocketIdUsernameMap);
        db.setPlayers(JSON.stringify(Object.values(SocketIdUsernameMap)));
        emitGameState();
    });
});

const setNewWord = async () => {
    let newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    db.setWord(newWord);
    emitGameState();
}

const emitGameState = async () => {
    let gameState = await db.getGameState(true);
    io.emit('GAME', gameState);
}

// Listen
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

server.listen(socketPort);