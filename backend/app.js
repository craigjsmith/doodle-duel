const express = require('express')
const { createServer } = require('node:http');

const db = require('./db')
const bodyParser = require('body-parser')
const expressSanitizer = require('express-sanitizer');
const { Server } = require("socket.io");
const { LobbyBouncer } = require('./LobbyBouncer');
const WORDS = require('./words.js');

const cors = require('cors')
const app = express()
const server = createServer(app);
const port = 3001
const socketPort = 4000

const CORS_ORGINS = ["https://doodle.craigsmith.dev", "http://localhost:3000"]

const POINTS_TO_WIN = 10;
const ROUND_DURATION = 30000;
const GRACE_DURTION = 1000;

app.use(cors({
    origin: CORS_ORGINS
}))

const io = new Server(server, {
    cors: {
        origin: CORS_ORGINS
    }
});

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
    bouncer.subscribeLobbyList(socket);

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
        try {
            let turn = JSON.parse(gameState?.turn)
            if (gameState && (socket.id == turn.socketId)) {
                startNewRound(lobbyId);
            }
        } catch (e) { }

        emitGameState(lobbyId);
        emitLobbyList();
    });

    async function onLogin(msg, id) {
        bouncer.addSocket(socket, msg);
        bouncer.joinLobby(socket.id, id);
        emitGameState(id);
        emitLobbyList();
    }

    async function onStart(msg) {
        let lobbyId = bouncer.getLobby(socket.id);
        await db.setGameStarted(lobbyId, 1)
        await db.setGameStage(lobbyId, "NEWGAME");
        startNewRound(lobbyId);
        emitGameState(lobbyId);
        emitLobbyList();
    }

    function stripString(str) {
        // All lower case, remove spaces and dashes
        return str.toLowerCase().replace(/[\s-]/g, '');
    }

    async function onGuess(msg, id) {
        var guess = msg;
        var strippedGuess = stripString(msg);

        if (guess) {
            let gameState = await getGameState(id, true);
            let turn = JSON.parse(gameState.turn);

            // Add guess to list of guesses
            let guesses = JSON.parse(gameState.guesses) ?? [];
            guesses.push({ "guess": guess, "player": { "socketId": socket.id, "username": bouncer.getUsername(socket.id) } });
            db.setGuesses(id, JSON.stringify(guesses));

            // Check if guess is correct
            let secretWord = stripString(gameState.word);
            if (secretWord === strippedGuess) {
                // If correct answer, award points to guesser and artist
                bouncer.awardPoints(socket.id, 2);
                bouncer.awardPoints(turn.socketId, 1);

                // Check if either point earner has won game
                if (bouncer.getPoints(socket.id) >= POINTS_TO_WIN || bouncer.getPoints(turn.socketId) >= POINTS_TO_WIN) {
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
    emitLobbyList();

    return true;
}

function onDraw(msg, id) {
    io.to(id).volatile.emit('DRAW', msg);
}

async function gameOver(lobbyId) {
    emitGameState(lobbyId);
    io.to(lobbyId).emit('GAMEOVER');
    removeLobby(lobbyId);
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
    if (gameState.gameStage === "NEWGAME") {
        firstRound = true;
    }

    if (!firstRound) {
        // Game stage: Reveal
        let previousWord = gameState.word;
        await db.setGameStage(id, "REVEAL");
        await db.setPreviousWord(id, previousWord);
        db.setTurn(id, null);

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
        let previousArtistIndex = gameState.players.findIndex(player => player.socketId == previousArtist.socketId);
        let numberOfPlayers = gameState.players.length
        let nextArtist = gameState.players[(previousArtistIndex + 1) % numberOfPlayers];
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

const emitLobbyList = async () => {
    let lobbies = await db.getAllPublicOpenLobbies();
    io.to("lobbyList").emit('LOBBYLIST', lobbies);
}

app.get('/isLobbyJoinable', async (req, res) => {
    let lobbies = await db.getAllOpenLobbies();
    const lobbyId = req.query.lobbyId;
    let lobbyIdList = lobbies.map((lobby) => { return lobby.id });
    res.send(lobbyIdList.includes(Number(lobbyId)))
})

app.get('/ping', async (req, res) => {
    res.send("pong")
})

app.get('/lobbies', async (req, res) => {
    let lobbies = await db.getAllPublicOpenLobbies();
    res.send(lobbies)
})

app.post('/createLobby', async (req, res) => {
    const lobbyName = req.query.lobbyName;
    const privateLobby = req.query.privateLobby;
    let newLobbyId = await db.createLobby(lobbyName, privateLobby);
    res.send({ newLobbyId })
    emitLobbyList();
})

// Listen
app.listen(port, () => {
    console.log(`Doodle Duel listening on port ${port}`)
})

server.listen(socketPort);

setInterval(async () => {
    // Purge empty lobbies every 10 minutes
    let lobbies = await db.getAllLobbies();
    let lobbyIdList = lobbies.map((lobby) => { return lobby.id });

    lobbyIdList.forEach(lobby => {
        removeLobbyIfEmpty(lobby);
    });
}, 600000);