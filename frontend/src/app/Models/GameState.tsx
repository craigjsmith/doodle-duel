import { Guess as GuessModel } from './Guess';
import { Player as PlayerModel } from './Player';

export interface GameState {
  id: number;
  roundWinner: PlayerModel | undefined;
  lobbyName: string;
  word: string;
  usedWords: Array<string>;
  players: Array<PlayerModel> | undefined;
  turn: PlayerModel;
  guesses: GuessModel[];
  endTimestamp: number;
  gameStarted: boolean;
  gameStage: string;
  playerCount: number;
}