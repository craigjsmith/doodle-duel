'use client'

import { useDisclosure } from '@mantine/hooks';
import { Container, Flex, Title, Button, Text, SimpleGrid, Modal, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

import { useEffect, useState } from 'react';
import LobbyCard from './components/LobbyCard';
import Login from './Login';
import LobbyCreator from './LobbyCreator';

export default function LobbyList(props: { lobby: number | null, setLobby: (lobbyId: number) => void, username: string | undefined, setUsername: (username: string) => void, login: () => void }) {
    const [lobbyList, setLobbyList] = useState<Array<number>>();
    const [loginOpened, { open: loginOpen, close: loginClose }] = useDisclosure(false);
    const [lobbyCreatorOpened, { open: lobbyCreatorOpen, close: lobbyCreatorClose }] = useDisclosure(false);

    useEffect(() => {
        getLobbies();
    }, []);

    useEffect(() => {
        if (props.lobby) {
            props.setLobby(props.lobby);
            loginOpen();
        }
    }, [lobbyList, props.lobby]);

    const getLobbies = () => {
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
    }

    const createLobby = (privateLobby: Boolean) => {
        fetch(`https://droplet.craigsmith.dev/createLobby/?privateLobby=${Number(privateLobby)}`, { method: "POST", })
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
                    onClick={() => { lobbyCreatorOpen(); }}
                >
                    Create a Lobby
                </Button>

                <Flex mt={20}>
                    {(lobbyList?.length ?? 0) > 0
                        ?
                        <Text size="lg">or join an open lobby!</Text>
                        :
                        <Alert variant="light" color="gray" p={30}>
                            There are no open lobbies
                        </Alert>
                    }
                </Flex>

                <SimpleGrid my={20} cols={2} style={{ width: '80%' }}>
                    {lobbyList?.map((lobby) =>
                        <LobbyCard lobbyId={lobby} onClick={() => {
                            props.setLobby(lobby);
                            loginOpen();
                        }} />
                    )}
                </SimpleGrid>

                <Modal opened={loginOpened} onClose={loginClose} title="Login">
                    <Login username={props.username || ''} setUsername={props.setUsername} login={props.login} />
                </Modal>

                <Modal opened={lobbyCreatorOpened} onClose={lobbyCreatorClose} title="Create Lobby">
                    <LobbyCreator createLobby={(privateLobby: Boolean) => {
                        createLobby(privateLobby);
                        lobbyCreatorClose();
                        loginOpen();
                    }} />
                </Modal>

            </Flex>
        </Container >
    )
}
