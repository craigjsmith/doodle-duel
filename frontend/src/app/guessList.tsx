'use client'

import { Center, Paper } from '@mantine/core';
import { IconClockHour3 } from '@tabler/icons-react';

import styles from './guessList.module.css'

import { useEffect, useState, useRef } from 'react';

export default function GuessList(props: { guesses: string[] }) {
    const [guessList, setGuessList] = useState<string[]>();

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
                                <Center>{guess}</Center>
                            </Paper>
                        </div>
                )
            }
        </div>
    )
}
