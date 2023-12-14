'use client'

import { useDisclosure } from '@mantine/hooks';
import { Container, Flex, Title, Button, Text, SimpleGrid, Modal } from '@mantine/core';

import { useEffect, useState } from 'react';
import LobbyCard from './components/LobbyCard';
import Login from './Login';

export default function LobbyList(props: { lobby: number | null, setLobby: (lobbyId: number) => void, username: string, setUsername: (username: string) => void, login: () => void }) {
    const [lobbyList, setLobbyList] = useState<Array<number>>();
    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        getLobbies();
    }, []);

    useEffect(() => {
        if (props.lobby && lobbyList?.includes(props.lobby)) {
            props.setLobby(props.lobby);
            open();
        }
    }, [lobbyList, props.lobby]);

    const getLobbies = () => {
        fetch('http://localhost:3001/lobbies')
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

    const createLobby = (privateLobby: Number) => {
        console.log("createLobby");

        fetch(`http://localhost:3001/createLobby/?privateLobby=${privateLobby}`, { method: "POST", })
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
                <Title order={1} mt={20}>Doodle Duel</Title>

                <Button
                    variant="filled"
                    radius="lg"
                    mt={20}
                    onClick={() => { createLobby(0); open(); }}
                >
                    Create a Public Lobby
                </Button>

                <Button
                    variant="filled"
                    radius="lg"
                    mt={20}
                    onClick={() => { createLobby(1); open(); }}
                >
                    Create a Private Lobby
                </Button>

                {(lobbyList?.length ?? 0) > 0 ? <Text size="lg" mt={20}>or join an open lobby!</Text> : undefined}

                <SimpleGrid my={20} cols={2} style={{ width: '80%' }}>
                    {lobbyList?.map((lobby) =>
                        <LobbyCard lobbyId={lobby} onClick={() => {
                            props.setLobby(lobby);
                            open();
                        }} />
                    )}
                </SimpleGrid>

                <Modal opened={opened} onClose={close} title="Login">
                    <Login username={props.username} setUsername={props.setUsername} login={props.login} />
                </Modal>

            </Flex>
        </Container >
    )
}
