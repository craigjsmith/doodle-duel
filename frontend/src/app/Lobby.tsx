'use client'

import { Container, Flex, Title, List, ThemeIcon, rem, Button, Loader, Text } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

import { Player } from './Models/Player';
import styles from './lobby-list.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Lobby(props: { lobbyId: number | null, players: Player[] | undefined, startGame: () => void | undefined }) {
    const [lobbyList, setLobbyList] = useState<Array<number>>();

    useEffect(() => {
        fetch('http://192.168.0.24:3001/lobbies')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Handle the data from the response
                console.log('Lobbies:', data);
                setLobbyList(data);
            })
            .catch(error => {
                console.error('Error fetching lobbies:', error);
            });

    }, []);

    return (
        <Container>
            <Flex
                mih={50}
                gap="md"
                justify="center"
                align="center"
                direction="column"
                wrap="wrap"
            >
                <Title order={1} my={20}>{`Lobby ${props.lobbyId}`}</Title>

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
                            my={20}
                            onClick={() => { props.startGame() }}
                        >
                            Start
                        </Button>
                        :
                        <Flex
                            my={20}
                            justify="center"
                            align="center"
                            direction="column">
                            <Loader type="dots" />
                            <Text size="md">Waiting for more players</Text>
                        </Flex>
                }

            </Flex>
        </Container>
    )
}
