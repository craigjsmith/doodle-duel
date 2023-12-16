const db = require('./db')

class LobbyBouncer {
    constructor() {
        this.sockets = new Map(); // key: socketId, value: socket object
        this.lobbyBySocketId = new Map(); // key: socketId, value: lobbyId
        this.usernameBySocketId = new Map(); // key: socketId, value: username
        this.pointsBySocketId = new Map(); // key: socketId, value: points
    }

    addSocket(socket, username) {
        this.sockets.set(socket.id, socket);
        this.usernameBySocketId.set(socket.id, username);
        this.pointsBySocketId.set(socket.id, 0)
    }

    removeSocket(socketId) {
        let lobbyId = this.lobbyBySocketId.get(socketId);
        db.incrementPlayerCount(lobbyId, -1)

        this.leaveLobby(socketId)
        this.usernameBySocketId.delete(socketId);
        this.lobbyBySocketId.delete(socketId);
        this.pointsBySocketId.delete(socketId);
        this.sockets.delete(socketId);
    }

    joinLobby(socketId, lobbyId) {
        db.incrementPlayerCount(lobbyId, 1)

        let socket = this.sockets.get(socketId);

        // Leave current lobby (if in one)
        this.leaveLobby(socketId);

        // Connect to new lobby
        this.lobbyBySocketId.set(socketId, lobbyId);
        socket.join(lobbyId);
    }

    leaveLobby(socketId) {
        let socket = this.sockets.get(socketId);

        // Disconnect from current lobby
        let currentLobby = this.lobbyBySocketId.get(socketId);
        if (currentLobby) {
            socket.leave(currentLobby);
        }

        // Remove records
        delete this.lobbyBySocketId[socketId];
        delete this.pointsBySocketId[socketId];
    }

    getLobby(socketId) {
        // Return lobbyId that user is a member of
        return this.lobbyBySocketId.get(socketId);
    }

    getUsername(socketId) {
        // Get username assigned to given socket
        return this.usernameBySocketId.get(socketId);
    }

    getUsernameBySocketId() {
        return this.usernameBySocketId;
    }

    awardPoints(socketId, amount) {
        let currentPoints = this.getPoints(socketId);
        this.pointsBySocketId.set(socketId, currentPoints + amount);
    }

    getPoints(socketId) {
        return this.pointsBySocketId.get(socketId);
    }

    toJSON(id) {
        let list = [];
        this.usernameBySocketId.forEach((username, socketId) => {
            if (this.lobbyBySocketId.get(socketId) == id) {
                list.push({ "socketId": socketId, "username": username, "points": this.pointsBySocketId.get(socketId) });
            }
        })
        return list;
    }

    print() {
        this.sockets.forEach((v, k) => {
            console.log("Socket ID: " + k);
            console.log("Username: " + this.usernameBySocketId.get(k));
            console.log("Lobby: " + this.lobbyBySocketId.get(k));
            console.log("Points: " + this.pointsBySocketId.get(k));
            console.log("----");
        })
    }
}

module.exports = { LobbyBouncer };