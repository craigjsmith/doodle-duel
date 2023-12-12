const express = require('express')
const { createServer } = require('node:http');
const { join } = require('node:path');

const db = require('./db')
const bodyParser = require('body-parser')
const expressSanitizer = require('express-sanitizer');
const { Server } = require("socket.io");
const { LobbyBouncer } = require('./lobbyBouncer');
const WORDS = require('./words.js');

const cors = require('cors')
const app = express()
const server = createServer(app);
const port = 3001
const socketPort = 4000

app.use(cors())

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const POINTS_TO_WIN = 10;

const ROUND_DURATION = 20000;
const END_OF_ROUND_DURATION = 6000;
const GRACE_DURTION = 1000;

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
        if (gameState && !socket.id.localeCompare(gameState.turn.socketId)) {
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
        await db.setGameStarted(lobbyId, 1)
        await db.setGameStage(lobbyId, "NEWGAME");
        startNewRound(lobbyId);
        emitGameState(lobbyId);
    }

    async function onGuess(msg, id) {
        var guess = msg.toLowerCase().replace(/[\s-]/g, '');

        if (guess) {
            let gameState = await getGameState(id, true);

            // Add guess to list of guesses
            let guesses = JSON.parse(gameState.guesses) ?? [];
            guesses.push(guess);
            db.setGuesses(id, JSON.stringify(guesses));

            // Check if guess is correct
            let secretWord = gameState.word.toLowerCase();
            if (!secretWord.localeCompare(guess.toLowerCase())) {
                // If correct answer, award points to guesser and artist
                bouncer.awardPoints(socket.id, 2);
                bouncer.awardPoints(gameState.turn, 1);

                // Check if either point earner has won game
                if (bouncer.getPoints(socket.id) >= POINTS_TO_WIN || bouncer.getPoints(gameState.turn.socketId) >= POINTS_TO_WIN) {
                    gameOver(id);
                }

                startNewRound(id);
            } else {
                await emitGameState(id);
            }
        }
    }
});

async function removeLobbyIfEmpty(lobbyId) {
    // Lobby is considered "empty" if there is 1 or less players while game is in progress, and 0 if game is not in progress
    let gameState = await getGameState(lobbyId);

    if (gameState) {
        let players = gameState.players;

        let minimumPlayers = gameState.gameStarted ? 2 : 1

        if (players.length < minimumPlayers) {
            gameOver(lobbyId);
        }
    }

    return false;
}

async function removeLobby(lobbyId) {
    clearTimeout(RoundEndTimeoutMap[lobbyId]);
    delete RoundEndTimeoutMap[lobbyId];

    console.log(`Deleting lobby ${lobbyId}`);
    db.removeLobby(lobbyId)

    return true;
}

async function onDraw(msg, id) {
    io.to(id).emit('DRAW', msg);
}

async function gameOver(lobbyId) {
    removeLobby(lobbyId);
    io.to(lobbyId).emit('GAMEOVER');
}

async function startNewRound(id) {
    clearTimeout(RoundEndTimeoutMap[id]);
    delete RoundEndTimeoutMap[id];

    let firstRound = false;
    let gameState = await getGameState(id, true);

    if (!gameState) {
        return;
    }

    // If first round, skip reveal and leaderboard
    if (!gameState.gameStage.localeCompare("NEWGAME")) {
        firstRound = true;
    }

    if (!firstRound) {
        // Game stage: Reveal
        let previousWord = gameState.word;
        await db.setGameStage(id, "REVEAL");
        await db.setPreviousWord(id, previousWord);

        await emitGameState(id);

        // Game stage: Leaderboard
        setTimeout(async () => {
            await db.setGameStage(id, "LEADERBOARD");
            await emitGameState(id);
        }, 3000);
    }

    // Game stage: New round
    setTimeout(async () => {
        onDraw(null, id)
        await db.setGameStage(id, "GAME");
        await db.setGuesses(id, JSON.stringify([]));

        await setNextPlayerAsArtist(id);
        await setNewWord(id);

        var date = new Date();
        date.setTime(date.getTime() + ROUND_DURATION + GRACE_DURTION);
        await db.setRoundEndTimestamp(id, date.getTime());

        await emitGameState(id);

        RoundEndTimeoutMap[id] = setTimeout(() => {
            console.log("FORCE ROUND END");
            startNewRound(id);
        }, ROUND_DURATION + GRACE_DURTION);
    }, firstRound ? 0 : 6000);
}

const setNewWord = async (id) => {
    let gameState = await getGameState(id, true);
    let previousWord = gameState.word;

    let wordsListExcludingPreviousWord = WORDS.filter((word) => word.localeCompare(previousWord));
    let newWord = wordsListExcludingPreviousWord[Math.floor(Math.random() * wordsListExcludingPreviousWord.length)];

    await db.setWord(id, newWord);
    await db.setPreviousWord(id, previousWord);

    let artist = JSON.parse(gameState.turn);

    // Reveal secret word only to the artist
    io.to(artist.socketId).emit('REVEAL', newWord);
}

const setNextPlayerAsArtist = async (id) => {
    let gameState = await getGameState(id);
    let previousArtist = JSON.parse(gameState.turn);

    if (previousArtist) {
        console.log("previousArtist: ");
        console.log(previousArtist);
        console.log("previousArtist.socketId: ");
        console.log(previousArtist.socketId);

        let previousArtistIndex = gameState.players.findIndex(player => player.socketId == previousArtist.socketId);
        console.log("previousArtistIndex: " + previousArtistIndex);

        let numberOfPlayers = gameState.players.length

        let nextArtist = gameState.players[(previousArtistIndex + 1) % numberOfPlayers];
        console.log("nextArtist: " + nextArtist);

        db.setTurn(id, JSON.stringify(nextArtist));
    } else {
        let nextArtist = gameState.players[0];

        db.setTurn(id, JSON.stringify(nextArtist));
    }
}

const getGameState = async (id, revealWord = false) => {
    let gameState = await db.getGameState(id, revealWord);
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