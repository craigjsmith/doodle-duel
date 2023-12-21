'use client'

import { Button,Center, Container, Title } from '@mantine/core';

import { Player as PlayerModel } from '../Models/Player';
import Leaderboard from './Leaderboard';

export default function GameOver(props: { players: PlayerModel[], back: () => void }) {

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
