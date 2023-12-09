const express = require('express')
const { createServer } = require('node:http');
const { join } = require('node:path');

const db = require('./db')
const bodyParser = require('body-parser')
const expressSanitizer = require('express-sanitizer');
const { Server } = require("socket.io");
const { LobbyBouncer } = require('./lobbyBouncer');

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

const ROUND_DURATION = 20000/*65000*/;

let bouncer = new LobbyBouncer();

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
    socket.on('guess', onGuess);
    socket.on('NEWDRAW', onDraw);
    socket.on('LOGIN', onLogin);
    socket.on('START', onStart);

    socket.on('disconnect', async () => {
        let lobbyId = bouncer.getLobby(socket.id);
        let gameState = await getGameState(lobbyId);

        // Remove disconnected player from records
        bouncer.removeSocket(socket.id);

        // If lobby has 1 (or less) players, delete it
        if (await removeLobbyIfEmpty(lobbyId)) {
            return;
        }

        // If current artist leaves, move to next round
        if (gameState && !socket.id.localeCompare(gameState.turn)) {
            startNewRound(lobbyId);
        }

        emitGameState(lobbyId);
    });

    async function onLogin(msg, id) {
        bouncer.addSocket(socket, msg);
        bouncer.joinLobby(socket.id, id);
        emitGameState(id);
    }

    async function onStart(msg) {
        let lobbyId = bouncer.getLobby(socket.id);
        db.setGameStarted(lobbyId, 1)
        startNewRound(lobbyId);
        emitGameState(lobbyId);
    }

    async function onGuess(msg, id) {
        var guess = msg; // TODO: sanitize

        if (guess) {
            let gameState = await getGameState(id);

            // Add guess to list of guesses
            let guesses = JSON.parse(gameState.guesses) ?? [];
            guesses.push(guess);
            db.setGuesses(id, JSON.stringify(guesses));

            // Check if guess is correct
            let secretWord = gameState.word.toString();
            if (!secretWord.localeCompare(guess.toLowerCase())) {
                // Correct answer
                bouncer.awardPoints(socket.id);
                bouncer.awardPoints(gameState.turn);
                startNewRound(id);
            } else {
                await emitGameState(id);
            }
        }
    }
});

async function removeLobbyIfEmpty(lobbyId) {
    // Lobby is considered "empty" if there is 1 or less players
    let gameState = await getGameState(lobbyId);

    if (gameState) {
        let players = gameState.players;

        if (players.length <= 1) {
            console.log(`Deleting lobby ${lobbyId}`);
            db.removeLobby(lobbyId)

            clearTimeout(RoundEndTimeoutMap[lobbyId]);
            delete RoundEndTimeoutMap[lobbyId];

            io.to(lobbyId).emit('GAMEOVER');
            return true;
        }
    }

    return false;
}

async function onDraw(msg, id) {
    io.to(id).emit('DRAW', msg);
}

async function startNewRound(id) {
    clearTimeout(RoundEndTimeoutMap[id]);
    delete RoundEndTimeoutMap[id];

    // Reset guess list
    await db.setGuesses(id, JSON.stringify([]));

    await setNextPlayerAsArtist(id);
    await setNewWord(id);

    var date = new Date();
    date.setTime(date.getTime() + ROUND_DURATION);
    await db.setRoundEndTimestamp(id, date.getTime());

    await emitGameState(id);

    RoundEndTimeoutMap[id] = setTimeout(() => {
        console.log("FORCE ROUND END");
        startNewRound(id);
    }, ROUND_DURATION);
}

const setNewWord = async (id) => {
    let gameState = await getGameState(id);
    let previousWord = gameState.word;

    let wordsListExcludingPreviousWord = WORDS.filter((word) => word.localeCompare(previousWord));
    let newWord = wordsListExcludingPreviousWord[Math.floor(Math.random() * wordsListExcludingPreviousWord.length)];

    await db.setWord(id, newWord);
    await db.setPreviousWord(id, previousWord);
}

const setNextPlayerAsArtist = async (id) => {
    let gameState = await getGameState(id);
    let previousArtistSocketId = gameState.turn;

    if (previousArtistSocketId) {
        let previousArtistIndex = gameState.players.findIndex(player => player.socketId == previousArtistSocketId);

        let numberOfPlayers = gameState.players.length

        let nextArtist = gameState.players[(previousArtistIndex + 1) % numberOfPlayers];

        db.setTurn(id, nextArtist.socketId);
    } else {
        let nextArtist = gameState.players[0];

        db.setTurn(id, nextArtist.socketId);
    }
}

const getGameState = async (id) => {
    let gameState = await db.getGameState(id, true);
    if (gameState) {
        gameState.players = bouncer.toJSON(id);
    }
    return gameState;
}

const emitGameState = async (id) => {
    io.to(id).emit('GAME', await getGameState(id));
}

app.get('/lobbies', async (req, res) => {
    let lobbies = await db.getOpenLobbyList(true);
    res.send(lobbies)
})

app.post('/createLobby', async (req, res) => {
    console.log("/createLobby");
    let newLobbyId = await db.createLobby();
    res.send({ newLobbyId })
})

// Listen
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

server.listen(socketPort);