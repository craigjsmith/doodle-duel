'use client'

import { Container, Center, Title, Button } from '@mantine/core';

import { Player } from './Models/Player';
import Leaderboard from './Leaderboard';

export default function GameOver(props: { players: Player[], back: () => void }) {

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
