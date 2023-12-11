'use client'

import { Container, Flex, Title, List, ThemeIcon, rem, Button, Loader, Text, Pill } from '@mantine/core';
import { IconClockHour3 } from '@tabler/icons-react';

import styles from './timer.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Timer(props: { endTimestamp: number, duration: number }) {
    const [secondsRemaining, setSecondsRemaining] = useState<number>();

    useEffect(() => {
        const interval = setInterval(() => {
            if (props.endTimestamp - Date.now() > props.duration * 1000) {
                /* Any built in "grace period" on timestamp is hidden from UI. This helps compensate for pauses
                between rounds and socket IO delay */
                setSecondsRemaining(props.duration);
            } else if (Date.now() < props.endTimestamp) {
                let timeRemaining = new Date(props.endTimestamp - Date.now());
                setSecondsRemaining(timeRemaining.getSeconds());
            } else {
                // End timer at zero (don't go negative)
                setSecondsRemaining(0);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [props.endTimestamp, secondsRemaining]);

    return (
        <Flex
            gap="xs"
            justify="flex-start"
            align="center"
            direction="row"
        >
            <div className={styles.timerContainer}>
                <IconClockHour3 color="#BF456C" style={{ width: rem(18), height: rem(18) }} />

                <h3 className={styles.timeNumber}>
                    {secondsRemaining}
                </h3>
            </div>

        </Flex>
    )
}
