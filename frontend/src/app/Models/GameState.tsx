import { Player } from './Player';

export interface GameState {
  id: number;
  word: string;
  previousWord: string;
  solved: boolean;
  players: Array<Player> | undefined;
  turn: Player;
  guesses: Array<string>;
  endTimestamp: number;
  gameStarted: boolean;
  gameStage: string;
}