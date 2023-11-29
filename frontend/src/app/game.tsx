'use client'

import { socket } from './socket';
import dynamic from 'next/dynamic'

import styles from './page.module.css'
import Whiteboard from './whiteboard';

import { useEffect, useState } from 'react';

interface GameState {
  id: number;
  word: string;
  previousWord: string;
  solved: boolean;
  players: Array<string>;
  turn: number;
}

const GameComponent = () => {
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
  }, [gameState]);

  const guess = async () => {
    socket.emit('guess', wordGuess);
  };

  const login = async () => {
    socket.emit('LOGIN', username);
  };

  const draw = async (img: any) => {
    console.log("sent to server:");
    console.log(img);
    socket.emit('NEWDRAW', img);
  };

  const isItMyTurn = () => {
    if (gameState) {
      return !username?.localeCompare(gameState.players[gameState.turn]);
    }
    return false;
  }

  function onGame(msg: any) {
    setGameState({ id: msg.id, word: msg.word, previousWord: msg.previousWord, solved: msg.solved, players: JSON.parse(msg.players), turn: msg.turn });
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

      {loggedIn ?
        <>
          {revealWord ? <h1>{gameState?.previousWord}</h1> : undefined}
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
