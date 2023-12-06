'use client'

import { socket } from './socket';
import dynamic from 'next/dynamic'

import styles from './page.module.css'
import Whiteboard from './whiteboard';
import Timer from './timer';

import { useEffect, useState } from 'react';
import LobbyList from './lobby-list';

interface GameState {
  id: number;
  word: string;
  previousWord: string;
  solved: boolean;
  players: any;
  turn: number;
  guesses: Array<string>;
  endTimestamp: number;
  gameStarted: boolean;
}

const GameComponent = () => {
  const [lobby, setLobby] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>();
  const [image, setImage] = useState<any>();
  const [wordGuess, setWordGuess] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [revealWord, setRevealWord] = useState<boolean>(false);

  useEffect(() => {
    // Reveal solution when round ends
    setRevealWord(true);
    setTimeout(() => {
      setImage(null);
      setRevealWord(false);
    }, 2000);
  }, [gameState?.previousWord])

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
  };

  const draw = async (img: any) => {
    console.log("sent to server:");
    console.log(img);
    socket.emit('NEWDRAW', img, lobby);
  };

  const isItMyTurn = () => {
    if (gameState) {

      console.log(gameState);
      console.log("players");
      console.log(gameState.players);
      console.log("turn");
      console.log(gameState.turn);

      return !username?.localeCompare(gameState.players[gameState.turn][1]);

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

  return (
    <>
      <h1 className={styles.title}>Doodle Duel!</h1>
      <p>{JSON.stringify(gameState)}</p>

      {loggedIn && gameState ?
        <>
          {revealWord ? <h1>{gameState?.previousWord}</h1> : undefined}
          <LobbyList />
          <Timer endTimestamp={gameState?.endTimestamp ?? 0} duration={10} />
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
        :
        <>
          <h3>Login</h3>
          <input type="text" onChange={(event) => { setUsername(event.target.value) }}></input>
          <input type="number" onChange={(event) => { setLobby(Number(event.target.value)) }}></input>
          <button onClick={() => {
            login();
            setLoggedIn(true);
          }}>Login</button>


        </>
      }
    </>
  )
}

const Game = dynamic(() => Promise.resolve(GameComponent), {
  ssr: false,
})

export default Game
