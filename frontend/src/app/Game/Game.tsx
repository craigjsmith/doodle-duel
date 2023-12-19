'use client'

import styles from './game.module.css'

import { useDisclosure } from '@mantine/hooks';
import { Button, Input, Center, Group, Flex, Modal, Title } from '@mantine/core';

import { useEffect, useState, useRef } from 'react';
import Timer from './timer';
import Whiteboard from './whiteboard';
import Leaderboard from './Leaderboard';
import GuessList from './guessList';
import { Player as PlayerModel } from '../Models/Player';
import { Guess as GuessModel } from '../Models/Guess';
import { Image as ImageModel } from '../Models/Image';

export default function Game(props: {
    secretWord: string | null,
    previousWord: string | null,
    endTimestamp: number,
    image: ImageModel | undefined | null,
    emitDrawing: (img: Uint8ClampedArray | undefined) => void,
    turn: PlayerModel | undefined,
    isMyTurn: boolean
    wordGuess: string | undefined,
    setWordGuess: (guess: string) => void,
    guess: () => void,
    players: PlayerModel[] | undefined,
    gameStage: string | undefined,
    guesses: GuessModel[] | undefined
}) {
    const [opened, { open, close }] = useDisclosure(false);
    const [unusableHeight, setUnusableHeight] = useState<number>(0);
    const topBarRef = useRef<HTMLDivElement>(null);
    const timerBarRef = useRef<HTMLDivElement>(null);
    const GUESS_LIST_HEIGHT = 50;

    useEffect(() => {
        setUnusableHeight((topBarRef.current?.clientHeight ?? 0) + (timerBarRef.current?.clientHeight ?? 0) + GUESS_LIST_HEIGHT);
    }, [topBarRef.current, timerBarRef.current]);

    useEffect(() => {
        if (props.gameStage === "LEADERBOARD") {
            open();
        } else {
            close();
        }
    }, [props.gameStage, close, open]);

    return (
        <div className={styles.game}>
            <Flex justify="center" align="center" className={styles.staticBar} ref={topBarRef}>
                {/* Show reveal word on reveal and leaderboard stage */}
                {
                    props.gameStage !== "GAME" && props.guesses
                        ? <Title order={3}><span className={styles.revealWord}>{props.previousWord}</span></Title>
                        : undefined
                }

                {/* Show word to be drawn if it's your turn and it hasn't been revealed yet */}
                {
                    (props.isMyTurn && props.gameStage === "GAME") ?
                        <Title order={3}>You are drawing <span className={styles.revealWord}>{props.secretWord}</span></Title>
                        :
                        undefined
                }

                {/* Show guess box if it's not your turn and word hasn't been revealed yet */}
                {(!props.isMyTurn && props.gameStage === "GAME")
                    ?
                    <Group>
                        <Input
                            size="m"
                            radius="md"
                            type="text"
                            placeholder="Your guess"
                            value={props.wordGuess || ''}
                            onChange={(event) => { props.setWordGuess(event.target.value) }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && props.wordGuess?.length) {
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
                            disabled={!props.wordGuess?.length}
                            className={styles.guessButton}
                        >
                            Guess
                        </Button>
                    </Group>
                    : undefined}
            </Flex>

            <Flex direction="column" ref={timerBarRef}>
                <Center pb={10} pt={10}>
                    <Timer endTimestamp={props.endTimestamp ?? 0} duration={30} active={Boolean(props.gameStage === "GAME")} />
                </Center>

                {
                    (!props.isMyTurn
                        ?
                        <Center pb={10}>
                            <Title order={5}>{props.turn?.username} is drawing</Title>
                        </Center>
                        : undefined)
                }
            </Flex>

            <div>
                <GuessList guesses={props.guesses ?? []} />
            </div>

            <Whiteboard image={props.image} emitDrawing={props.emitDrawing} enable={props.isMyTurn && props.gameStage === "GAME"} unusuableHeight={unusableHeight} turn={props.turn} />

            <Modal opened={opened} onClose={close} withCloseButton={false} closeOnClickOutside={false} closeOnEscape={false} title="Leaderboard">
                <Leaderboard players={props.players ?? []} />
            </Modal>
        </div>
    )
}
