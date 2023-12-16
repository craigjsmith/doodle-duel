const mysql = require('mysql')

// DBMS setup
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'app',
    password: 'E2MLAWX92Tz&tMcnfGm&',
    database: 'db'
})

connection.connect((error) => {
    if (error) {
        console.log(error);
    }
})

function getGameState(id, revealWord = false) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM game WHERE id = ?';
        const values = [id];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            if (rows[0] && !revealWord) {
                rows[0].word = null;
            }

            return resolve(rows[0]);
        })
    });
}

function getOpenLobbyList() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT id FROM game WHERE gameStarted=0 AND privateLobby=0', (err, rows) => {
            if (err) {
                return reject(err);
            }

            let arr = rows.map(item => item.id);

            return resolve(arr);
        })
    });
}

function getAllLobbies() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT id, lobbyName FROM game WHERE gameStarted=0', (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows);
        })
    });
}

function getAllOpenLobbies() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT id, lobbyName FROM game WHERE gameStarted=0', (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows);
        })
    });
}

function getAllPublicOpenLobbies() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT id, lobbyName FROM game WHERE gameStarted=0 AND privateLobby=0', (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows);
        })
    });
}

function setWord(id, value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET word = ? WHERE id = ?';
        const values = [value, id];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setGameStage(id, value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET gameStage = ? WHERE id = ?';
        const values = [value, id];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setPreviousWord(id, value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET previousWord = ? WHERE id = ?';
        const values = [value, id];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setRoundEndTimestamp(id, value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET endTimestamp = ? WHERE id = ?';
        const values = [value, id];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setGuesses(id, value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET guesses = ? WHERE id = ?';
        const values = [value, id];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setTurn(id, value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET turn = ? WHERE id = ?';
        const values = [value, id];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setGameStarted(id, value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET gameStarted = ? WHERE id = ?';
        const values = [value, id];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}


function createLobby(lobbyName, privateLobby) {
    return new Promise((resolve, reject) => {

        const query = 'INSERT INTO game (lobbyName, privateLobby) VALUES (?, ?)';
        const values = [lobbyName, privateLobby];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }
            return resolve(rows.insertId);
        })
    });
}

function removeLobby(lobbyId) {
    return new Promise((resolve, reject) => {

        const query = 'DELETE FROM game WHERE id = ?';
        const values = [lobbyId];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }
            return resolve(rows.insertId);
        })
    });
}

module.exports = { getGameState, getOpenLobbyList, getAllLobbies, getAllOpenLobbies, getAllPublicOpenLobbies, setWord, setGameStage, setPreviousWord, setRoundEndTimestamp, setGuesses, setTurn, setGameStarted, createLobby, removeLobby };