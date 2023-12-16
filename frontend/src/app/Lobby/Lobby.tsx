'use client'

import { Container, Flex, Title, List, ThemeIcon, rem, Button, Loader, Text, CopyButton, Group, Input } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

import { Player } from '../Models/Player';
import styles from './lobby.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Lobby(props: { lobbyId: number | null, lobbyName: string | undefined, players: Player[] | undefined, startGame: () => void | undefined }) {
    const [lobbyList, setLobbyList] = useState<Array<number>>();

    const URL = window.location.origin + "/?lobby=" + props.lobbyId;

    useEffect(() => {
        fetch('https://droplet.craigsmith.dev/lobbies')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Handle the data from the response
                setLobbyList(data);
            })
            .catch(error => {
                console.error('Error fetching lobbies:', error);
            });

    }, []);

    return (
        <>
            <div className={styles.topBar}>
                <Title order={1} my={20}>{props.lobbyName}</Title>
            </div>
            <Container>
                <Flex
                    mih={50}
                    gap="md"
                    justify="center"
                    align="center"
                    direction="column"
                    wrap="wrap"
                >

                    <Flex direction="column" align="center" my={50}>
                        <Text size="md" mb={4}>Share this link to invite players</Text>
                        <CopyButton value={URL}>
                            {({ copied, copy }) => (
                                <Group gap={0}>
                                    <Input
                                        variant='filled'
                                        radius={0}
                                        type="text"
                                        value={URL}
                                        className={styles.linkInput}
                                        onClick={() => { copy() }}
                                        mx={0}
                                    />

                                    <Button onClick={() => { copy() }} radius={0} mx={0}>
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                </Group>
                            )}
                        </CopyButton>
                    </Flex>

                    <List
                        spacing="xs"
                        size="sm"
                        center
                        icon={
                            <ThemeIcon variant="light" size={33} radius="xl">
                                <IconUser style={{ width: rem(16), height: rem(16) }} />
                            </ThemeIcon>
                        }
                    >
                        {props.players?.map((player) => <List.Item><Text size="xl">{player.username}</Text></List.Item>)}
                    </List>

                    {
                        (props.players?.length ?? 0) > 1 ?
                            <Button
                                variant="filled"
                                radius="xl"
                                my={40}
                                onClick={() => { props.startGame() }}
                            >
                                Start
                            </Button>
                            :
                            <Flex
                                my={40}
                                justify="center"
                                align="center"
                                direction="column">
                                <Loader type="dots" />
                                <Text size="md">Waiting for more players</Text>
                            </Flex>
                    }

                </Flex>
            </Container>
        </>
    )
}
