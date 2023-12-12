'use client'

import styles from './game.module.css'

import { useDisclosure } from '@mantine/hooks';
import { Button, Input, Center, Group, Flex, Box, Modal } from '@mantine/core';

import { useEffect, useState, useRef } from 'react';
import Timer from './timer';
import Whiteboard from './whiteboard';
import Leaderboard from './Leaderboard';
import { Player } from './Models/Player';

export default function Game(props: {
    secretWord: string | null,
    previousWord: string | null,
    endTimestamp: number,
    image: any,
    draw: (img: any) => void,
    isMyTurn: boolean
    wordGuess: string | undefined,
    setWordGuess: (guess: string) => void,
    guess: () => void,
    players: Player[] | undefined,
    gameStage: string | undefined
}) {

    const [opened, { open, close }] = useDisclosure(false);
    const [topBarHeight, setTopBarHeight] = useState<number>(0);
    const topBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTopBarHeight(topBarRef.current?.clientHeight ?? 0);
    });

    useEffect(() => {
        console.log("topBarHeight: " + topBarHeight);
    }, [topBarHeight]);

    useEffect(() => {
        if (!props.gameStage?.localeCompare("LEADERBOARD")) {
            open();
        } else {
            close();
        }
    }, [props.gameStage]);

    return (
        <div className={styles.game}>
            <div className={styles.fixedTextBox} ref={topBarRef}>
                <Center>
                    {/* Show reveal word on reveal and leaderboard stage */}
                    {props.gameStage?.localeCompare("GAME") ? <h3>{props.previousWord}</h3> : undefined}

                    {/* Show word to be drawn if it's your turn and it hasn't been revealed yet */}
                    {(props.isMyTurn && !props.gameStage?.localeCompare("GAME")) ? <h3>You are drawing: {props.secretWord}</h3> : undefined}

                    {/* Show guess box if it's not your turn and word hasn't been revealed yet */}
                    {(!props.isMyTurn && !props.gameStage?.localeCompare("GAME"))
                        ?
                        <Group>
                            <Input
                                size="m"
                                radius="md"
                                type="text"
                                placeholder="Your guess"
                                value={props.wordGuess}
                                onChange={(event) => { props.setWordGuess(event.target.value) }}
                                onSubmit={() => { console.log("AHHH") }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        props.guess();
                                    }
                                }}
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
                        : undefined}
                </Center>
            </div >

            <Flex pt={100} direction="column">
                <Center pb={10}>
                    <Timer endTimestamp={props.endTimestamp ?? 0} duration={20} />
                </Center>

                <Whiteboard image={props.image} draw={props.draw} enable={props.isMyTurn} unusuableHeight={topBarHeight} />
            </Flex>

            <Modal opened={opened} onClose={close} withCloseButton={false} closeOnClickOutside={false} closeOnEscape={false} title="Leaderboard">
                <Leaderboard players={props.players ?? []} />
            </Modal>
        </div>
    )
}
