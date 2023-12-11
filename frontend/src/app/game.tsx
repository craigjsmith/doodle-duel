'use client'

import styles from './game.module.css'

import { Button, Input, Center, Group, Flex } from '@mantine/core';

import { useEffect, useState, useRef } from 'react';
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

    return (
        <>
            <div className={styles.fixedTextBox}>
                {!props.isMyTurn ?
                    <Center>
                        <Group>
                            <Input
                                size="m"
                                radius="md"
                                type="text"
                                placeholder="Your guess"
                                onChange={(event) => { props.setWordGuess(event.target.value) }}
                            />

                            <Button
                                variant="bright"
                                size="s"
                                radius="md"
                                my={15}
                                onClick={() => { props.guess() }}
                            >
                                Guess
                            </Button>
                        </Group>
                    </Center>

                    :
                    <Center>
                        {props.revealWord ? <h1>{props.previousWord}</h1> : (props.secretWord ? <h1>You are drawing: {props.secretWord}</h1> : undefined)}
                    </Center>
                }
            </div>
            <Flex pt={100} direction="column">
                <Center>
                    <Timer endTimestamp={props.endTimestamp ?? 0} duration={20} />
                </Center>

                <Whiteboard image={props.image} draw={props.draw} enable={props.isMyTurn} />
            </Flex>
        </>
    )
}
