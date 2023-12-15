'use client'

import { socket } from './socket';
import dynamic from 'next/dynamic'

import { useEffect, useState } from 'react';
import LobbyList from './LobbyList';
import Lobby from './Lobby';

import { GameState } from './Models/GameState';
import Game from './game';
import GameOver from './GameOver';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const [screen, setScreen] = useState<Screens>(Screens.LobbyList);
  const [secretWord, setSecretWord] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  const router = useRouter();
  const lobbyFromURL = useSearchParams().get("lobby");

  useEffect(() => {
    console.log("lobbyFromURL" + lobbyFromURL);
    setLobby(Number(lobbyFromURL));
  }, []);

  useEffect(() => {
    if (gameState) {
      setIsMyTurn(!socket.id.localeCompare(gameState?.turn?.socketId));
    }
  }, [gameState?.turn]);

  useEffect(() => {
    if (gameState?.gameStage == undefined) {
      setImage(null);
    }
  }, [gameState?.gameStage])

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
    await socket.emit('guess', wordGuess, lobby);
    setWordGuess('');
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
    setGameState({ id: msg.id, word: msg.word, previousWord: msg.previousWord, solved: msg.solved, players: msg.players, turn: JSON.parse(msg.turn), guesses: JSON.parse(msg.guesses), endTimestamp: msg.endTimestamp, gameStarted: msg.gameStarted, gameStage: msg.gameStage });
  }

  function onDraw(img: any) {
    console.log("GOT DRAWING");
    console.log(img);
    setImage(img);
  }

  function onReveal(msg: any) {
    setSecretWord(msg);
  }

  function screenRouter() {
    switch (screen) {
      case Screens.LobbyList: {
        return (
          <LobbyList lobby={lobby} setLobby={setLobby} username={username} setUsername={setUsername} login={login} />
        );
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
            previousWord={gameState?.previousWord ?? null}
            endTimestamp={gameState?.endTimestamp ?? 0}
            image={image}
            draw={draw}
            turn={gameState?.turn}
            isMyTurn={isMyTurn}
            wordGuess={wordGuess}
            setWordGuess={setWordGuess}
            guess={guess}
            players={gameState?.players}
            gameStage={gameState?.gameStage}
            guesses={gameState?.guesses}
          />
        );
      }

      case Screens.GameOver: {
        return (
          <GameOver players={gameState?.players ?? []} back={() => { setScreen(Screens.LobbyList) }} />
        );
      }
    }
  }

  return (
    <>
      {screenRouter()}
    </>
  );
}

const Page = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
})

export default Page
