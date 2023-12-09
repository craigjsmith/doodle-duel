'use client'

import styles from './timer.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Timer(props: { endTimestamp: number, duration: number }) {
    const [secondsRemaining, setSecondsRemaining] = useState<number>();

    useEffect(() => {
        const interval = setInterval(() => {
            if (props.endTimestamp - Date.now() > props.duration * 2000) {
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
        <>
            <h3>Time remaining: {secondsRemaining}</h3>
        </>
    )
}
