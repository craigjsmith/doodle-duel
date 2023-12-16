'use client'

import { useDisclosure } from '@mantine/hooks';
import { Alert, Flex, Title, Button, Text, SimpleGrid, Modal, Box } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

import { useCallback, useEffect, useState } from 'react';
import LobbyCard from './LobbyCard';
import Login from './Login';
import LobbyCreator from './LobbyCreator';
import Image from 'next/image';
import { Lobby as LobbyModel } from '../Models/Lobby';

export default function LobbyList({
    lobby,
    setLobby,
    username,
    setUsername,
    login,
    lobbyList,
    setLobbyList,
}: {
    lobby: number | null;
    setLobby: (lobbyId: number | null) => void;
    username: string | undefined;
    setUsername: (username: string) => void;
    login: () => void;
    lobbyList: LobbyModel[] | undefined;
    setLobbyList: (list: any) => void;
}) {

    const [loginOpened, { open: loginOpen, close: loginClose }] = useDisclosure(false);
    const [lobbyCreatorOpened, { open: lobbyCreatorOpen, close: lobbyCreatorClose }] = useDisclosure(false);
    const [errorOpened, { open: errorOpen, close: errorClose }] = useDisclosure(false);

    const getLobbies = useCallback(() => {
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
    }, [setLobbyList])

    const joinLobby = useCallback(async (lobbyId: number) => {
        let joinable = await isLobbyJoinable(lobbyId);
        if (joinable) {
            setLobby(lobbyId);
            loginOpen();
        } else {
            setLobby(null);
            errorOpen();
            getLobbies();
        }
    }, [errorOpen, getLobbies, loginOpen, setLobby])

    useEffect(() => {
        getLobbies();
    }, [getLobbies]);

    useEffect(() => {
        if (lobby) {
            joinLobby(lobby);
        }
    }, [lobbyList, lobby, joinLobby]);

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
                setLobby(data.newLobbyId);
            })
            .catch(error => {
                console.error('Error fetching lobbies:', error);
            });
    }

    const isLobbyJoinable = (lobbyId: number): Promise<Boolean> => {
        let joinable = new Promise<boolean>(async (resolve, reject) => {
            await fetch(`https://droplet.craigsmith.dev/isLobbyJoinable/?lobbyId=${lobbyId}`, { method: "GET", })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error checking if lobby is joinable:', error);
                    resolve(false);
                });

            resolve(false);
        });

        return joinable;
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

                <Flex mt={20} px={100} justify='center'>
                    {(lobbyList?.length ?? 0) > 0
                        ?
                        <Text size="lg">or join an open lobby!</Text>
                        :
                        <Text c="dimmed" size="lg">There are no open lobbies</Text>
                    }
                </Flex>

                <SimpleGrid my={20} cols={2}>
                    {lobbyList?.map((lobby) =>
                        lobby.playerCount > 0 ?
                            <LobbyCard key={lobby.id} lobbyId={lobby.id} lobbyName={lobby.lobbyName} playerCount={lobby.playerCount} onClick={() => {
                                joinLobby(lobby.id);
                            }} />
                            : undefined
                    )}
                </SimpleGrid>

                <Modal opened={loginOpened} onClose={loginClose} title="Login">
                    <Login username={username || ''} setUsername={setUsername} login={login} />
                </Modal>

                <Modal opened={lobbyCreatorOpened} onClose={lobbyCreatorClose} title="Create Lobby">
                    <LobbyCreator createLobby={(lobbyName: string, privateLobby: Boolean) => {
                        createLobby(lobbyName, privateLobby);
                        lobbyCreatorClose();
                        loginOpen();
                    }} />
                </Modal>

                <Modal.Root opened={errorOpened} onClose={errorClose}>
                    <Modal.Overlay />
                    <Modal.Content>
                        <Alert data-autofocus variant="outline" color="pink" title="Error" withCloseButton icon={<IconInfoCircle />} onClose={errorClose}>
                            This lobby can not be joined.
                        </Alert>
                    </Modal.Content>
                </Modal.Root>

            </Flex>
        </ >
    )
}
