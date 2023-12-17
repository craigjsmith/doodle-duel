'use client'


import { Container, Text, List } from '@mantine/core';

export default function Rules() {
    return (
        <Container>
            <Text size="md">Welcome to Doodle Duel, the fast-paced drawing game that's all about quick sketches and sharp guesses!</Text>

            <Text size="md" fw={700} mt={16} mb={6}>How to Play:</Text>
            <List type="ordered">
                <List.Item>Players take turns drawing a prompt in just 30 seconds.</List.Item>
                <List.Item>The rest of the crew tries to guess what's being drawn.</List.Item>
            </List>

            <Text size="md" fw={700} mt={16} mb={6}>Scoring:</Text>
            <List>
                <List.Item>Correct Guess: Guess correctly and score 2 points! The artist also gets 1 point.</List.Item>
                <List.Item>No Guess: No points if nobody figures it out.</List.Item>
            </List>

            <Text size="md" fw={700} mt={16} mb={6}>Winning:</Text>
            <Text size="md">First to 10 points wins! Get ready to doodle and dominate in Doodle Duel!</Text>
        </Container>
    )
}
