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

const ROUND_DURATION = 65000;

// key: socket id, value: username
var SocketIdUsernameMap = {};

// key: game id, value: timeout reference
var RoundEndTimeoutMap = {};

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

    socket.on('guess', onGuess);
    socket.on('NEWDRAW', onDraw);
    socket.on('LOGIN', onLogin);

    socket.on('disconnect', () => {
        delete SocketIdUsernameMap[socket.id];
        console.log(SocketIdUsernameMap);
        db.setPlayers(JSON.stringify(Object.values(SocketIdUsernameMap)));
        emitGameState();
    });

    async function onLogin(msg) {
        console.log('SOCKET MESSAGE (DRAW): ' + msg);
        SocketIdUsernameMap[socket.id] = msg;
        console.log(SocketIdUsernameMap);
        db.setPlayers(JSON.stringify(Object.values(SocketIdUsernameMap)));
        emitGameState();
    }
});

async function onGuess(msg) {
    console.log('SOCKET MESSAGE: ' + msg);

    var guess = msg; // TODO: sanitize

    if (guess) {
        let gameState = await db.getGameState(true);

        // Add guess to list of guesses
        let guesses = JSON.parse(gameState.guesses) ?? [];
        guesses.push(guess);
        db.setGuesses(JSON.stringify(guesses));

        // Check if guess is correct
        let secretWord = gameState.word.toString();
        if (!secretWord.localeCompare(guess.toLowerCase())) {
            // Correct answer
            startNewRound();
        } else {
            await emitGameState();
        }
    }
}

async function onDraw(msg) {
    io.emit('DRAW', msg);
}

async function startNewRound() {
    let gameState = await db.getGameState(true);

    clearTimeout(RoundEndTimeoutMap[gameState.id]);
    delete RoundEndTimeoutMap[gameState.id];

    // Reset guess list
    await db.setGuesses(JSON.stringify([]));

    await setNextPlayerAsArtist();
    await setNewWord();

    var date = new Date();
    date.setTime(date.getTime() + ROUND_DURATION);
    await db.setRoundEndTimestamp(date.getTime());

    await emitGameState();

    RoundEndTimeoutMap[gameState.id] = setTimeout(() => {
        console.log("FORCE ROUND END");
        startNewRound();
    }, ROUND_DURATION);
}

const setNewWord = async () => {
    let gameState = await db.getGameState(true);
    let previousWord = gameState.word;
    let newWord = previousWord

    while (!previousWord.localeCompare(newWord)) {
        newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    }

    await db.setWord(newWord);
    await db.setPreviousWord(previousWord);
}

const setNextPlayerAsArtist = async () => {
    let gameState = await db.getGameState(true);
    let currentArtist = gameState.turn;
    let players = JSON.parse(gameState.players);
    let numberOfPlayers = players.length;
    let nextArtist = (currentArtist + 1) % numberOfPlayers;
    db.setTurn(nextArtist ?? null);
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