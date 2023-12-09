'use client'

import { socket } from './socket';
import dynamic from 'next/dynamic'

import styles from './page.module.css'
import Whiteboard from './whiteboard';
import Timer from './timer';

import { useEffect, useState } from 'react';
import LobbyList from './LobbyList';
import Lobby from './Lobby';

import { GameState } from './Models/GameState';

enum Screens {
  LobbyList,
  Login,
  Lobby,
  Game
}

const GameComponent = () => {
  const [lobby, setLobby] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>();
  const [image, setImage] = useState<any>();
  const [wordGuess, setWordGuess] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [revealWord, setRevealWord] = useState<boolean>(false);
  const [screen, setScreen] = useState<Screens>(Screens.LobbyList);

  useEffect(() => {
    // Reveal solution when round ends
    setRevealWord(true);
    setTimeout(() => {
      setImage(null);
      setRevealWord(false);
    }, 1000);
  }, [gameState?.previousWord])

  useEffect(() => {
    if (gameState?.gameStarted) {
      setScreen(Screens.Game);
    }
  }, [gameState?.gameStarted])

  useEffect(() => {
    socket.connect();
    socket.on('GAME', onGame);
    socket.on('DRAW', onDraw);
  }, []);

  const guess = async () => {
    socket.emit('guess', wordGuess, lobby);
  };

  const login = async () => {
    socket.emit('LOGIN', username, lobby);
    setScreen(Screens.Lobby);
  };

  const draw = async (img: any) => {
    console.log("sent to server:");
    console.log(img);
    socket.emit('NEWDRAW', img, lobby);
  };

  const startLobby = async () => {
    socket.emit('START');
  };

  const isItMyTurn = () => {
    if (gameState) {

      console.log(gameState);
      console.log("players");
      console.log(gameState.players);
      console.log("turn");
      console.log(gameState.turn);

      return !username?.localeCompare(gameState.players[gameState.turn].username);

    }
    return false;
  }

  function onGame(msg: any) {
    console.log(msg);
    setGameState({ id: msg.id, word: msg.word, previousWord: msg.previousWord, solved: msg.solved, players: msg.players, turn: msg.turn, guesses: JSON.parse(msg.guesses), endTimestamp: msg.endTimestamp, gameStarted: msg.gameStarted });
  }

  function onDraw(img: any) {
    console.log("GOT DRAWING");
    console.log(img);
    setImage(img);
  }

  switch (screen) {
    case Screens.LobbyList: {
      return (<LobbyList setLobby={(lobbyId) => { setLobby(lobbyId); setScreen(Screens.Login) }} />);
    }

    case Screens.Login: {
      return (
        <>
          <h3>Login</h3>
          <input type="text" onChange={(event) => { setUsername(event.target.value) }}></input>
          <button onClick={() => {
            login();
          }}>Login</button >
        </>
      );
    }

    case Screens.Lobby: {
      return (<>
        <Lobby lobbyId={lobby} players={gameState?.players} startGame={() => { startLobby() }} />
      </>);
    }

    case Screens.Game: {
      return (
        <>
          {JSON.stringify(gameState)}
          {revealWord ? <h1>{gameState?.previousWord}</h1> : undefined}
          <Timer endTimestamp={gameState?.endTimestamp ?? 0} duration={20} />
          <Whiteboard image={image} draw={draw} enable={isItMyTurn()} />
          <br />
          {!isItMyTurn() ?
            <>
              <input type="text" onChange={(event) => { setWordGuess(event.target.value) }}></input>
              <button onClick={() => {
                guess();
              }}>guess</button>
            </>
            : undefined}
        </>
      );
    }

  }
}

const Game = dynamic(() => Promise.resolve(GameComponent), {
  ssr: false,
})

export default Game
