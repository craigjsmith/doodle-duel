import { Player as PlayerModel } from "./Player";

export interface Guess {
    guess: string,
    player: PlayerModel,
}