import { Player } from './Player';

export interface GameState {
  id: number;
  lobbyName: string
  word: string;
  previousWord: string;
  solved: boolean;
  players: Array<Player> | undefined;
  turn: Player;
  guesses: { guess: string, player: { socketId: number, username: string } }[];
  endTimestamp: number;
  gameStarted: boolean;
  gameStage: string;
}