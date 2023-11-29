const mysql = require('mysql')

// DBMS setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'db'
})

connection.connect()

function getGameState(revealWord = false) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM game WHERE id=1', (err, rows) => {
            if (err) {
                return reject(err);
            }

            if (!revealWord) {
                rows[0].word = null;
            }

            return resolve(rows[0]);
        })
    });
}

function setWord(value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET word = ? WHERE id = ?';
        const values = [value, 1];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setPreviousWord(value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET previousWord = ? WHERE id = ?';
        const values = [value, 1];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setRoundEndTimestamp(value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET endTimestamp = ? WHERE id = ?';
        const values = [value, 1];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setPlayers(value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET players = ? WHERE id = ?';
        const values = [value, 1];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setGuesses(value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET guesses = ? WHERE id = ?';
        const values = [value, 1];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

function setTurn(value) {
    return new Promise((resolve, reject) => {

        const query = 'UPDATE game SET turn = ? WHERE id = ?';
        const values = [value, 1];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            return resolve(rows[0]);
        })
    });
}

module.exports = { getGameState, setWord, setPreviousWord, setRoundEndTimestamp, setPlayers, setGuesses, setTurn };