'use client'

import { useDisclosure } from '@mantine/hooks';
import { Container, Flex, Title, Button, Text, SimpleGrid, Modal, Box } from '@mantine/core';

import { useEffect, useState } from 'react';
import LobbyCard from './LobbyCard';
import Login from './Login';
import LobbyCreator from './LobbyCreator';
import Image from 'next/image';

export default function LobbyList(props: { lobby: number | null, setLobby: (lobbyId: number) => void, username: string | undefined, setUsername: (username: string) => void, login: () => void }) {
    const [lobbyList, setLobbyList] = useState<{ id: number; lobbyName: string | undefined }[]>();
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

    const joinLobby = (lobbyId: number) => {
        if (isLobbyJoinable(lobbyId)) {

        }
    }

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

    const createLobby = (lobbyName: string, privateLobby: Boolean) => {
        fetch(`https://droplet.craigsmith.dev/createLobby/?lobbyName=${lobbyName}&privateLobby=${Number(privateLobby)}`, { method: "POST", })
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

    const isLobbyJoinable = (lobbyId: number): Boolean => {
        fetch(`https://droplet.craigsmith.dev/isLobbyJoinable/?lobbyId=${lobbyId}`, { method: "GET", })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Refresh Lobby List
                return (Boolean(data));
            })
            .catch(error => {
                console.error('Error checking if lobby is joinable:', error);
            });

        return false;
    }

    return (
        <>
            <Flex
                mih={50}
                gap="md"
                justify="center"
                align="center"
                direction="column"
                wrap="wrap"
            >
                <Box mt={20}>
                    <Image
                        src="images/icon.svg"
                        width={85}
                        height={85}
                        alt="Doodle Duel"
                    />
                </Box>

                <Title order={1} c="#3b3b3b">Doodle Duel</Title>

                <Button
                    variant="filled"
                    radius="lg"
                    mt={20}
                    onClick={() => { lobbyCreatorOpen(); }}
                >
                    Create a Lobby
                </Button>

                <Flex mt={20} px={100}>
                    {(lobbyList?.length ?? 0) > 0
                        ?
                        <Text size="lg">or join an open lobby!</Text>
                        :
                        <Text c="dimmed" size="lg">There are no open lobbies</Text>
                    }
                </Flex>

                <SimpleGrid my={20} cols={2}>
                    {lobbyList?.map((lobby) =>
                        <LobbyCard key={lobby.id} lobbyId={lobby.id} lobbyName={lobby.lobbyName} onClick={() => {
                            props.setLobby(lobby.id);
                            loginOpen();
                        }} />
                    )}
                </SimpleGrid>

                <Modal opened={loginOpened} onClose={loginClose} title="Login">
                    <Login username={props.username || ''} setUsername={props.setUsername} login={props.login} />
                </Modal>

                <Modal opened={lobbyCreatorOpened} onClose={lobbyCreatorClose} title="Create Lobby">
                    <LobbyCreator createLobby={(lobbyName: string, privateLobby: Boolean) => {
                        createLobby(lobbyName, privateLobby);
                        lobbyCreatorClose();
                        loginOpen();
                    }} />
                </Modal>

            </Flex>
        </ >
    )
}
