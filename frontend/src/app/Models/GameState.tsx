import { Guess } from './Guess';
import { Player } from './Player';

export interface GameState {
  id: number;
  lobbyName: string
  word: string;
  previousWord: string;
  solved: boolean;
  players: Array<Player> | undefined;
  turn: Player;
  guesses: Guess[];
  endTimestamp: number;
  gameStarted: boolean;
  gameStage: string;
}