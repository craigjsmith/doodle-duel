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
    revealWord: boolean,
    previousWord: string | null,
    endTimestamp: number,
    image: any,
    draw: (img: any) => void,
    isMyTurn: boolean
    setWordGuess: (guess: string) => void,
    guess: () => void,
    players: Player[] | undefined,
    showLeaderboard: boolean
}) {

    const [opened, { open, close }] = useDisclosure(false);
    const [topBarHeight, setTopBarHeight] = useState<number>(0);
    const topBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTopBarHeight(topBarRef.current?.clientHeight ?? 0);
    }, []);


    useEffect(() => {
        if (props.showLeaderboard) {
            open();
        } else {
            close();
        }
    }, [props.showLeaderboard]);

    return (
        <>
            <div className={styles.fixedTextBox} ref={topBarRef}>
                <Center>

                    {(props.isMyTurn || props.revealWord) ? <Center>
                        {props.revealWord ? <h3>{props.previousWord}</h3> : (props.secretWord ? <h3>You are drawing: {props.secretWord}</h3> : undefined)}
                    </Center> : <Group>
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
                    </Group>}

                    {/* {!props.isMyTurn ?
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
                        :
                        <Center>
                            {props.revealWord ? <h3>{props.previousWord}</h3> : (props.secretWord ? <h3>You are drawing: {props.secretWord}</h3> : undefined)}
                        </Center>
                    } */}

                    <Box pl={20}>
                        <Timer endTimestamp={props.endTimestamp ?? 0} duration={20} />
                    </Box>
                </Center>
            </div>
            <Flex pt={100} direction="column">
                <Whiteboard image={props.image} draw={props.draw} enable={props.isMyTurn} unusuableHeight={topBarHeight} />
            </Flex>

            <Modal opened={opened} onClose={close} title="Leaderboard">
                <Leaderboard players={props.players} />
            </Modal>
        </>
    )
}
