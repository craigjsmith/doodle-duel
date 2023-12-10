'use client'

import { Container, Flex, Title, Button, Text, SimpleGrid, Modal } from '@mantine/core';

import { useEffect, useState } from 'react';
import Timer from './timer';
import Whiteboard from './whiteboard';

export default function Game(props: {
    secretWord: string | null,
    revealWord: boolean,
    previousWord: string | null,
    endTimestamp: number,
    image: any,
    draw: (img: any) => void,
    isMyTurn: boolean
    setWordGuess: (guess: string) => void,
    guess: () => void,
}) {
    const [lobbyList, setLobbyList] = useState<Array<number>>();

    useEffect(() => {

    }, []);

    return (
        <>
            {props.secretWord ? <h1>{props.secretWord}</h1> : undefined}
            {props.revealWord ? <h1>{props.previousWord}</h1> : undefined}
            <Timer endTimestamp={props.endTimestamp ?? 0} duration={20} />
            <Whiteboard image={props.image} draw={props.draw} enable={props.isMyTurn} />
            <br />
            {!props.isMyTurn ?
                <>
                    <input type="text" onChange={(event) => { props.setWordGuess(event.target.value) }}></input>
                    <button onClick={() => {
                        props.guess();
                    }}>guess</button>
                </>
                : undefined}
        </>
    )
}
