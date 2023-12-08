const mysql = require('mysql')

// DBMS setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'db'
})

connection.connect()

function getGameState(id, revealWord = false) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM game WHERE id = ?';
        const values = [id];

        connection.query(query, values, (err, rows) => {
            if (err) {
                return reject(err);
            }

            // if (!revealWord) {
            //     rows[0].word = null;
            // }

            return resolve(rows[0]);
        })
    });
}

function getOpenLobbyList() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT id FROM game WHERE gameStarted=0', (err, rows) => {
            if (err) {
                return reject(err);
            }

            let arr = rows.map(item => item.id);

            return resolve(arr);
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

// function setPlayers(id, value) {
//     return new Promise((resolve, reject) => {

//         const query = 'UPDATE game SET players = ? WHERE id = ?';
//         const values = [value, id];

//         connection.query(query, values, (err, rows) => {
//             if (err) {
//                 return reject(err);
//             }

//             return resolve(rows[0]);
//         })
//     });
// }

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

function createLobby() {
    return new Promise((resolve, reject) => {

        const query = 'INSERT INTO game VALUES ()';

        connection.query(query, (err, rows) => {
            if (err) {
                return reject(err);
            }

            // let lobbies = Array(rows[0]);

            console.log(rows.insertId);

            return resolve(rows.insertId);
        })
    });
}

module.exports = { getGameState, getOpenLobbyList, setWord, setPreviousWord, setRoundEndTimestamp, setGuesses, setTurn, createLobby };