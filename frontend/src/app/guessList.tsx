'use client'

import { Center, Paper, Flex, Text } from '@mantine/core';
import { IconClockHour3 } from '@tabler/icons-react';

import styles from './guessList.module.css'

import { useEffect, useState, useRef } from 'react';

export default function GuessList(props: { guesses: { guess: string, player: { socketId: number, username: string } }[] }) {
    const [guessList, setGuessList] = useState<{ guess: string, player: { socketId: number, username: string } }[]>();

    useEffect(() => {
        setGuessList(props.guesses.reverse());
    }, [props.guesses]);

    return (
        <div className={styles.outerContainer}>
            {
                guessList?.map(
                    (guess) =>
                        <div className={styles.innerContainer}>
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
