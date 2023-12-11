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
    }, []);


    useEffect(() => {
        if (!props.gameStage?.localeCompare("LEADERBOARD")) {
            open();
        } else {
            close();
        }
    }, [props.gameStage]);

    return (
        <>
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
                        : undefined}

                    <Box pl={20}>
                        <Timer endTimestamp={props.endTimestamp ?? 0} duration={20} />
                    </Box>
                </Center>
            </div >
            <Flex pt={100} direction="column">
                <Whiteboard image={props.image} draw={props.draw} enable={props.isMyTurn} unusuableHeight={topBarHeight} />
            </Flex>

            <Modal opened={opened} onClose={close} title="Leaderboard">
                <Leaderboard players={props.players} />
            </Modal>
        </>
    )
}
