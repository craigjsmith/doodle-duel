'use client'

import styles from './lobbyCard.module.css'

import { Text, Paper } from '@mantine/core';

export default function LobbyCard(props: {
    lobbyId: number,
    lobbyName: string | undefined,
    playerCount?: number | undefined,
    onClick: () => void
}) {
    return (
        <Paper className={styles.lobbyButton} onClick={props.onClick} shadow="sm" withBorder p="xl">
            <Text ta="center">
                {props.lobbyName ?? props.lobbyId}
            </Text>

            <Text c="dimmed" ta="center">
                {props.playerCount ? `${props.playerCount} players` : undefined}
            </Text>
        </Paper >
    )
}
