'use client'

import { Paper, Flex, Text } from '@mantine/core';

import styles from './guessList.module.css'

import { useEffect, useState } from 'react';
import { Guess as GuessModel } from '../Models/Guess';

export default function GuessList(props: { guesses: GuessModel[] }) {
    const [guessList, setGuessList] = useState<GuessModel[]>();

    useEffect(() => {
        setGuessList(props.guesses.reverse());
    }, [props.guesses]);

    return (
        <div className={styles.outerContainer}>
            {
                guessList?.map(
                    (guess) =>
                        <div className={styles.innerContainer} key={guess.guess + guess.player.socketId}>
                            <Paper shadow="xs" radius="md" withBorder className={styles.wordBox}>
                                <Flex direction="row">
                                    <Text c="dimmed" mr={5}>{guess.player.username} :</Text>
                                    <Text>{guess.guess}</Text>
                                </Flex>
                            </Paper>
                        </div>
                )
            }
        </div>
    )
}
