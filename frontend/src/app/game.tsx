'use client'

import { socket } from './socket';
import dynamic from 'next/dynamic'

import Image from 'next/image'
import styles from './page.module.css'
import Whiteboard from './whiteboard';

import { useEffect, useState } from 'react';

interface GameState {
  id: number;
  word: string;
  solved: boolean;
  players: Array<string>;
  turn: number;
}

const GameComponent = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameState, setGameState] = useState<GameState>();
  const [image, setImage] = useState<any>();
  const [wordGuess, setWordGuess] = useState<string>();
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    console.log("drawing changed");
    console.log(image);
  }, [image]);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onWord(msg: string) {
      setGameState({ id: 1, word: msg });
    }

    function onGame(msg: any) {
      setGameState({ id: msg.id, word: msg.word, solved: msg.solved, players: JSON.parse(msg.players), turn: msg.turn });
      //setGameState(msg);
    }

    function onDraw(img: any) {
      console.log("GOT DRAWING");
      console.log(img);
      setImage(img);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('WORD', onWord);
    socket.on('GAME', onGame);
    socket.on('DRAW', onDraw);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    console.log(gameState);

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

  return (
    <>
      <h1 className={styles.title}>Pictionary!</h1>

      <h2>{isItMyTurn() ? "It is your turn" : "Not your turn"}</h2>

      <h2>turn: {gameState?.players[gameState.turn]}</h2>

      {console.log("turn: " + gameState?.players[gameState.turn])}

      <h2>{JSON.stringify(gameState)}</h2>

      <h2>Socket is {isConnected ? "connected" : "not connected"}</h2>

      <input type="text" onChange={(event) => { setUsername(event.target.value) }}></input>
      <button onClick={() => {
        login();
      }}>Login</button>

      <h2>Secret word: {gameState ? gameState.word : undefined}</h2>

      <input type="text" onChange={(event) => { setWordGuess(event.target.value) }}></input>
      <button onClick={() => {
        guess();
      }}>guess</button>

      <br />

      <Whiteboard image={image} draw={draw} username={username} currentArtist={gameState?.players[gameState.turn]} />
    </>
  )
}

const Game = dynamic(() => Promise.resolve(GameComponent), {
  ssr: false,
})

export default Game
