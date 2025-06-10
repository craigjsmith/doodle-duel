'use client'

import { Button, Center, Container, Title } from '@mantine/core';
// @ts-ignore
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

import { Player as PlayerModel } from '../Models/Player';
import Leaderboard from './Leaderboard';

export default function GameOver(props: { players: PlayerModel[], back: () => void }) {
    useEffect(() => {
        // Only show confetti if there's a winner (don't show if everyone leaves)
        if (props.players.length >= 2) {
            confetti({
                spread: 100
            });
        }
    }, [props.players])

    return (
        <Container>
            <Center><Title order={1} my={20}>Game Over</Title></Center>
            <Container size="xs">
                <Leaderboard players={props.players ?? []} />
            </Container>

            <Center>
                <Button
                    variant="bright"
                    size="s"
                    radius="md"
                    mt={50}
                    onClick={() => { props.back() }}
                >
                    Back to Lobbies
                </Button>
            </Center>
        </Container >
    )
}
