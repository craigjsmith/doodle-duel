'use client'

import { Container, List,Text } from '@mantine/core';

export default function Rules() {
    return (
        <Container data-autofocus>
            <Text size="md">Welcome to Doodle Duel, the fast-paced drawing game that&apos;s all about quick sketches and sharp guesses!</Text>

            <Text size="md" fw={700} mt={16} mb={6}>How to Play:</Text>
            <List>
                <List.Item>Players take turns drawing a prompt in just 30 seconds.</List.Item>
                <List.Item>The rest of the players try to guess what&apos;s being drawn.</List.Item>
            </List>

            <Text size="md" fw={700} mt={16} mb={6}>Scoring:</Text>
            <List>
                <List.Item>Guess correctly and score 2 points! The artist also gets 1 point.</List.Item>
                <List.Item>No points if nobody figures it out.</List.Item>
            </List>

            <Text size="md" fw={700} mt={16} mb={6}>Winning:</Text>
            <Text size="md">First to 10 points wins!</Text>
        </Container>
    )
}
