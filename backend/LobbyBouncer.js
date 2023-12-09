class LobbyBouncer {
    constructor() {
        // this.sockets = [];
        this.sockets = new Map(); // key: socketId, value: socket object
        this.lobbyBySocketId = new Map(); // key: socketId, value: lobbyId
        this.usernameBySocketId = new Map(); // key: socketId, value: username
    }

    addSocket(socket, username) {
        this.sockets.set(socket.id, socket);
        this.usernameBySocketId.set(socket.id, username);
    }

    removeSocket(socketId) {
        this.leaveLobby(socketId)
        this.usernameBySocketId.delete(socketId);
        this.lobbyBySocketId.delete(socketId);
        this.sockets.delete(socketId);
    }

    joinLobby(socketId, lobbyId) {
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

        // Remove record
        delete this.lobbyBySocketId[socketId];
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

    toJSON(id) {
        let list = [];
        this.usernameBySocketId.forEach((username, socketId) => {
            console.log("socketId: " + socketId);
            console.log("id: " + id);
            if (this.lobbyBySocketId.get(socketId) == id) {
                list.push({ "socketId": socketId, "username": username });
            }
        })
        return list;
    }

    print() {
        this.sockets.forEach((v, k) => {
            console.log("Socket ID: " + k);
            console.log("Username: " + this.usernameBySocketId.get(k));
            console.log("Lobby: " + this.lobbyBySocketId.get(k));
            console.log("----");
        })
    }
}

module.exports = { LobbyBouncer };