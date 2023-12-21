'use client'

import { Flex, Paper, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

import { Guess as GuessModel } from '../Models/Guess';
import styles from './guessList.module.css'

export default function GuessList(props: { guesses: GuessModel[] }) {
    const [guessList, setGuessList] = useState<GuessModel[]>();

    useEffect(() => {
        setGuessList(props.guesses.reverse());
    }, [props.guesses]);

    return (
        <div className={styles.outerContainer}>
            {
                guessList?.map(
                    (guess, index) =>
                        <div className={styles.innerContainer} key={index}>
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
