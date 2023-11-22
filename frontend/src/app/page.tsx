'use client'

import Game from "./game";

interface GameState {
  id: number;
  word: string;
}

export default function Home() {


  return (
    <>
      <Game />
    </>
  )
}
