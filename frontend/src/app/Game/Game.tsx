'use client'

import { Button, Center, Flex, Group, Input, Modal, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';

import { Guess as GuessModel } from '../Models/Guess';
import { Image as ImageModel } from '../Models/Image';
import { Player as PlayerModel } from '../Models/Player';
import styles from './game.module.css'
import GuessList from './guessList';
import Leaderboard from './Leaderboard';
import Timer from './timer';
import Whiteboard from './whiteboard';

export default function Game(props: {
    secretWord: string | null,
    previousWord: string | null,
    roundWinner: PlayerModel | undefined,
    endTimestamp: number,
    image: ImageModel | undefined | null,
    emitDrawing: (img: string | undefined) => void,
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
    }, []);

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
                {/* Show reveal word on reveal stage */}
                {
                    props.gameStage === "REVEAL"
                        ? <Title order={3}>{props.roundWinner ? `${props.roundWinner.username} got it: ` : undefined}<span className={styles.revealWord}>{props.previousWord}</span></Title>
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
                    (!props.isMyTurn && props.gameStage !== "LEADERBOARD"
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
