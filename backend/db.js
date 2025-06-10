const Database = require('better-sqlite3');
const fs = require('fs');
const schema = fs.readFileSync('./schema.sqlite.sql', 'utf8');
const db = new Database('./database.sqlite');
db.exec(schema);

function getGameState(id, revealWord = false) {
    const stmt = db.prepare('SELECT * FROM game WHERE id = ?');
    const row = stmt.get(id);

    if (row && !revealWord) {
        row.word = null;
    }

    return Promise.resolve(row);
}

function getOpenLobbyList() {
    const stmt = db.prepare('SELECT id FROM game WHERE gameStarted=0 AND privateLobby=0');
    const rows = stmt.all();
    const arr = rows.map(item => item.id);
    return Promise.resolve(arr);
}

function getAllLobbies() {
    const stmt = db.prepare('SELECT id, lobbyName, playerCount FROM game');
    const rows = stmt.all();
    return Promise.resolve(rows);
}

function getAllOpenLobbies() {
    const stmt = db.prepare('SELECT id, lobbyName, playerCount FROM game WHERE gameStarted=0');
    const rows = stmt.all();
    return Promise.resolve(rows);
}

function getAllPublicOpenLobbies() {
    const stmt = db.prepare('SELECT id, lobbyName, playerCount FROM game WHERE gameStarted=0 AND privateLobby=0');
    const rows = stmt.all();
    return Promise.resolve(rows);
}

function setWord(id, value) {
    const stmt = db.prepare('UPDATE game SET word = ? WHERE id = ?');
    stmt.run(value, id);
    return Promise.resolve();
}

function setRoundWinner(id, value) {
    const stmt = db.prepare('UPDATE game SET roundWinner = ? WHERE id = ?');
    stmt.run(value, id);
    return Promise.resolve();
}

function setGameStage(id, value) {
    const stmt = db.prepare('UPDATE game SET gameStage = ? WHERE id = ?');
    stmt.run(value, id);
    return Promise.resolve();
}

function setRoundEndTimestamp(id, value) {
    const stmt = db.prepare('UPDATE game SET endTimestamp = ? WHERE id = ?');
    stmt.run(value, id);
    return Promise.resolve();
}

function setGuesses(id, value) {
    const stmt = db.prepare('UPDATE game SET guesses = ? WHERE id = ?');
    stmt.run(value, id);
    return Promise.resolve();
}

function setUsedWords(id, value) {
    const stmt = db.prepare('UPDATE game SET usedWords = ? WHERE id = ?');
    stmt.run(value, id);
    return Promise.resolve();
}

function setTurn(id, value) {
    const stmt = db.prepare('UPDATE game SET turn = ? WHERE id = ?');
    stmt.run(value, id);
    return Promise.resolve();
}

function setGameStarted(id, value) {
    const stmt = db.prepare('UPDATE game SET gameStarted = ? WHERE id = ?');
    stmt.run(value, id);
    return Promise.resolve();
}

function incrementPlayerCount(id, value) {
    const stmt = db.prepare('UPDATE game SET playerCount = playerCount + ? WHERE id = ?');
    stmt.run(value, id);
    return Promise.resolve();
}

function createLobby(lobbyName, privateLobby) {
    const stmt = db.prepare('INSERT INTO game (lobbyName, privateLobby) VALUES (?, ?)');
    const info = stmt.run(lobbyName, privateLobby);
    return Promise.resolve(info.lastInsertRowid);
}

function removeLobby(lobbyId) {
    const stmt = db.prepare('DELETE FROM game WHERE id = ?');
    stmt.run(lobbyId);
    return Promise.resolve();
}

module.exports = { getGameState, getOpenLobbyList, getAllLobbies, getAllOpenLobbies, getAllPublicOpenLobbies, setRoundWinner, setWord, setGameStage, setRoundEndTimestamp, setUsedWords, setGuesses, setTurn, setGameStarted, incrementPlayerCount, createLobby, removeLobby };