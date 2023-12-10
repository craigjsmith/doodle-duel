'use client'

import styles from './lobbyCard.module.css'

import { Text, Paper } from '@mantine/core';

export default function LobbyCard(props: { lobbyId: number, playerCount?: number, onClick: () => void }) {
    return (
        <Paper className={styles.lobbyButton} onClick={props.onClick} shadow="sm" withBorder p="xl">
            <Text ta="center">{props.lobbyId}</Text>
            {props.playerCount ? <Text c="dimmed" ta="center">{`${props.playerCount} players`}</Text> : undefined}

        </Paper >
    )
}
