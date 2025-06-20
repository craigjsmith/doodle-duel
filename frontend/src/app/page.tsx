'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { useCallback, useEffect, useState } from 'react';

import Game from './Game/Game';
import GameOver from './Game/GameOver';
import Lobby from './Lobby/Lobby';
import LobbyList from './LobbyList/LobbyList';
import { GameState as GameStateModel } from './Models/GameState';
import { Image as ImageModel } from './Models/Image';
import { Lobby as LobbyModel } from './Models/Lobby';
import { socket } from './socket';

enum Screens {
  LobbyList,
  Lobby,
  Game,
  GameOver
}

const PageComponent = () => {
  const [lobby, setLobby] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameStateModel>();
  const [image, setImage] = useState<ImageModel | null>();
  const [wordGuess, setWordGuess] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [screen, setScreen] = useState<Screens>(Screens.LobbyList);
  const [secretWord, setSecretWord] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false);
  const [lobbyList, setLobbyList] = useState<LobbyModel[]>();

  const lobbyFromURL = useSearchParams().get("lobby");

  const preventNavigation = useCallback((e: BeforeUnloadEvent) => {
    var confirmationMessage = 'Are you sure you want to leave the game?';
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }, [])

  useEffect(() => {
    setLobby(Number(lobbyFromURL));
  }, [lobbyFromURL]);

  useEffect(() => {
    if (gameState) {
      setIsMyTurn(socket.id === gameState?.turn?.socketId);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState?.gameStage == "LEADERBOARD") {
      setImage(null);
    } else if (gameState?.gameStage == "GAME") {
      window.addEventListener('beforeunload', preventNavigation);
    }

  }, [gameState?.gameStage, preventNavigation])

  useEffect(() => {
    if (gameState?.gameStarted) {
      setScreen(Screens.Game);
    }
  }, [gameState?.gameStarted])

  useEffect(() => {
    socket.connect();
    socket.on('LOBBYLIST', onLobbyList);
    socket.on('GAME', onGame);
    socket.on('DRAW', onDraw);
    socket.on('REVEAL', onReveal);
    socket.on('GAMEOVER', () => {
      setScreen(Screens.GameOver);
      window.removeEventListener('beforeunload', preventNavigation);
    });
  }, [preventNavigation]);

  const guess = async () => {
    await socket.emit('guess', wordGuess, lobby);
    setWordGuess('');
  };

  const login = async () => {
    socket.emit('LOGIN', username, lobby);
    posthog.identify(username)
    setScreen(Screens.Lobby);
  };

  const emitDrawing = (img: string | undefined) => {
    setTimeout(() => {
      socket.volatile.emit('NEWDRAW', { img: img, artist: socket.id }, lobby);
    });
  };

  const startLobby = async () => {
    socket.emit('START');
  };

  function onGame(msg: any) {
    if (msg) {
      setGameState({
        id: msg.id,
        roundWinner: JSON.parse(msg.roundWinner),
        lobbyName: msg.lobbyName,
        word: msg.word,
        usedWords: JSON.parse(msg.usedWords),
        players: msg.players,
        turn: JSON.parse(msg.turn),
        guesses: JSON.parse(msg.guesses),
        endTimestamp: msg.endTimestamp,
        gameStarted: msg.gameStarted,
        gameStage: msg.gameStage,
        playerCount: msg.playerCount
      });
    }
  }

  function onLobbyList(msg: LobbyModel[]) {
    if (msg) {
      setLobbyList(msg);
    }
  }

  function onDraw(img: ImageModel) {
    setImage(img);
  }

  function onReveal(msg: string) {
    setSecretWord(msg);
  }

  function screenRouter() {
    switch (screen) {
      case Screens.LobbyList: {
        return (
          <LobbyList lobby={lobby} setLobby={setLobby} username={username} setUsername={setUsername} login={login} lobbyList={lobbyList} setLobbyList={setLobbyList} />
        );
      }

      case Screens.Lobby: {
        return (
          <Lobby lobbyId={lobby} lobbyName={gameState?.lobbyName} players={gameState?.players} startGame={() => { startLobby() }} />
        );
      }

      case Screens.Game: {
        return (
          <Game
            secretWord={secretWord}
            roundWinner={gameState?.roundWinner}
            usedWords={gameState?.usedWords ?? []}
            endTimestamp={gameState?.endTimestamp ?? 0}
            image={image}
            emitDrawing={emitDrawing}
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
          <GameOver players={gameState?.players ?? []} back={() => {
            location.reload();
          }} />
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
