'use client'

import styles from './lobbyList.module.css'

import { useDisclosure } from '@mantine/hooks';
import { Container, Flex, Title, Button, Text, SimpleGrid, Modal, Input, Group, Center } from '@mantine/core';

import { useEffect, useState, useRef } from 'react';
import LobbyCard from './components/LobbyCard';

export default function LobbyList(props: { setLobby: (lobbyId: number) => void, setUsername: (username: string) => void, login: () => void }) {
    const [lobbyList, setLobbyList] = useState<Array<number>>();
    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        getLobbies();
    }, []);

    const getLobbies = () => {
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
    }

    const createLobby = () => {
        console.log("createLobby");

        fetch('http://192.168.0.24:3001/createLobby', { method: "POST", })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Refresh Lobby List
                props.setLobby(data.newLobbyId);
            })
            .catch(error => {
                console.error('Error fetching lobbies:', error);
            });
    }

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
                <Title order={1} my={20}>Doodle Duel</Title>

                <Button
                    variant="filled"
                    radius="xl"
                    my={15}
                    onClick={() => { createLobby(); open(); }}
                >
                    Create a Lobby
                </Button>

                <Text size="lg" my={20}>or join a lobby!</Text>

                <SimpleGrid cols={2} style={{ width: '80%' }}>
                    {lobbyList?.map((lobby) =>
                        <LobbyCard lobbyId={lobby} playerCount={2} onClick={() => {
                            props.setLobby(lobby);
                            open();
                        }} />
                    )}
                </SimpleGrid>

                <Modal opened={opened} onClose={close} title="Login">
                    <Center>
                        <Group>
                            <Input
                                size="s"
                                radius="md"
                                type="text"
                                placeholder="Your username"
                                onChange={(event) => { props.setUsername(event.target.value) }}
                            />

                            <Button
                                variant="filled"
                                size="s"
                                radius="md"
                                my={15}
                                onClick={() => { props.login(); }}
                            >
                                Go
                            </Button>
                        </Group>
                    </Center>
                </Modal>

            </Flex>
        </Container>
    )
}
