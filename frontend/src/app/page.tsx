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
import Game from './game';

enum Screens {
  LobbyList,
  Lobby,
  Game,
  GameOver
}

const PageComponent = () => {
  const [lobby, setLobby] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>();
  const [image, setImage] = useState<any>();
  const [wordGuess, setWordGuess] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [revealWord, setRevealWord] = useState<boolean>(false);
  const [screen, setScreen] = useState<Screens>(Screens.LobbyList);
  const [secretWord, setSecretWord] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false);

  useEffect(() => {
    if (gameState) {
      setIsMyTurn(!socket.id.localeCompare(gameState?.turn));
    }
  }, [gameState?.turn]);

  useEffect(() => {

    if (!secretWord?.localeCompare(gameState?.previousWord)) {
      setSecretWord(null);
    }

    // Reveal solution when round ends
    setRevealWord(true);
    setTimeout(() => {
      setImage(null);
      setRevealWord(false);
    }, 3000);
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
    socket.on('REVEAL', onReveal);
    socket.on('GAMEOVER', () => { setScreen(Screens.GameOver) });

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

  function onGame(msg: any) {
    console.log(msg);
    setGameState({ id: msg.id, word: msg.word, previousWord: msg.previousWord, solved: msg.solved, players: msg.players, turn: msg.turn, guesses: JSON.parse(msg.guesses), endTimestamp: msg.endTimestamp, gameStarted: msg.gameStarted });
  }

  function onDraw(img: any) {
    console.log("GOT DRAWING");
    console.log(img);
    setImage(img);
  }

  function onReveal(msg: any) {
    setSecretWord(msg);
  }

  function router() {
    switch (screen) {
      case Screens.LobbyList: {
        return (<LobbyList setLobby={setLobby} setUsername={setUsername} login={login} />);
      }

      case Screens.Lobby: {
        return (
          <Lobby lobbyId={lobby} players={gameState?.players} startGame={() => { startLobby() }} />
        );
      }

      case Screens.Game: {
        return (
          <Game
            secretWord={secretWord}
            revealWord={revealWord}
            previousWord={gameState?.previousWord ?? null}
            endTimestamp={gameState?.endTimestamp ?? 0}
            image={image}
            draw={draw}
            isMyTurn={isMyTurn}
            setWordGuess={setWordGuess}
            guess={guess}
          />
        );
      }

      case Screens.GameOver: {
        return (<>
          <h1>Game Over!</h1>
        </>);
      }


    }
  }

  return (
    <>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      {router()}
    </>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
})

export default Page
