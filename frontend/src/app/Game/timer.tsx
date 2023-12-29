'use client'

import { Flex, rem } from '@mantine/core';
import { IconClockHour3 } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import styles from './timer.module.css'

export default function Timer(props: { endTimestamp: number, duration: number, active: boolean }) {
    const [secondsRemaining, setSecondsRemaining] = useState<number>(props.duration);

    useEffect(() => {
        const interval = setInterval(() => {
            if (props.active) {
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
            }

            if (!props.endTimestamp) {
                setSecondsRemaining(props.duration);
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [props.active, props.duration, props.endTimestamp, secondsRemaining]);

    return (
        <Flex
            gap="xs"
            justify="flex-start"
            align="center"
            direction="row"
        >
            <div className={`${styles.timerContainer} ${props.active ? '' : styles.timerContainerStopped}`
            }>
                <IconClockHour3 color="#BF456C" style={{ width: rem(18), height: rem(18) }} />

                <h3 className={styles.timeNumber}>
                    {secondsRemaining}
                </h3>
            </div>
        </Flex>
    )
}
