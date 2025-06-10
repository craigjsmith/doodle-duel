CREATE TABLE IF NOT EXISTS game (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lobbyName TEXT,
    privateLobby INTEGER DEFAULT 0,
    gameStarted INTEGER DEFAULT 0,
    playerCount INTEGER DEFAULT 0,
    word TEXT,
    roundWinner TEXT,
    gameStage TEXT,
    endTimestamp INTEGER,
    guesses TEXT,
    usedWords TEXT,
    turn TEXT
);
