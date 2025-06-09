CREATE TABLE game (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lobbyName VARCHAR(255),
    privateLobby BOOLEAN DEFAULT 0,
    gameStarted BOOLEAN DEFAULT 0,
    playerCount INT DEFAULT 0,
    word VARCHAR(255),
    roundWinner VARCHAR(255),
    gameStage VARCHAR(50),
    endTimestamp BIGINT,
    guesses TEXT,
    usedWords TEXT,
    turn VARCHAR(255)
);
