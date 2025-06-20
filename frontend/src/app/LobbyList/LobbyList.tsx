'use client'

import { ActionIcon, Alert, Box, Button, Flex, Modal, SimpleGrid, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconInfoCircle, IconQuestionMark } from '@tabler/icons-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { Lobby as LobbyModel } from '../Models/Lobby';
import Footer from './Footer';
import LobbyCard from './LobbyCard';
import LobbyCreator from './LobbyCreator';
import styles from './lobbyList.module.css'
import Login from './Login';
import Rules from './Rules';

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
    setLobbyList: (list: LobbyModel[]) => void;
}) {

    const [loginOpened, { open: loginOpen, close: loginClose }] = useDisclosure(false);
    const [lobbyCreatorOpened, { open: lobbyCreatorOpen, close: lobbyCreatorClose }] = useDisclosure(false);
    const [errorOpened, { open: errorOpen, close: errorClose }] = useDisclosure(false);
    const [rulesOpened, { open: rulesOpen, close: rulesClose }] = useDisclosure(false);
    const [serverError, setServerError] = useState<Boolean>(false);


    const getLobbies = useCallback(() => {
        fetch('https://doodle-duel-896989562989.us-central1.run.app/lobbies')
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
                setServerError(true);
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
        fetch(`https://doodle-duel-896989562989.us-central1.run.app/createLobby/?lobbyName=${lobbyName}&privateLobby=${Number(privateLobby)}`, { method: "POST", })
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
            await fetch(`https://doodle-duel-896989562989.us-central1.run.app/isLobbyJoinable/?lobbyId=${lobbyId}`, { method: "GET", })
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
        <Flex
            mih={50}
            gap="md"
            justify="center"
            align="center"
            direction="column"
            wrap="wrap"
        >
            <Box mt={25}>
                <Image
                    src="images/icon.svg"
                    width={85}
                    height={85}
                    alt="Doodle Duel"
                    priority={true}
                />
            </Box>

            <Title order={1} c="#3b3b3b">Doodle Duel</Title>

            <ActionIcon variant="outline" color="pink" radius="xl" size="xl" aria-label="Help" onClick={rulesOpen} className={styles.helpButton}>
                <IconQuestionMark style={{ width: '70%', height: '70%' }} stroke={1.5} />
            </ActionIcon>

            {
                !serverError ?
                    <Button
                        variant="filled"
                        radius="lg"
                        mt={20}
                        onClick={() => { lobbyCreatorOpen(); }}
                    >
                        Create a Lobby
                    </Button> :
                    undefined
            }

            <Flex mt={20} px={100} justify='center'>
                {
                    serverError ? (
                        <Text size="lg">Server appears to be offline, please try again later.</Text>
                    ) : (lobbyList?.length ?? 0) ? (
                        <Text size="lg">or join an open lobby!</Text>
                    ) : (
                        <Text c="dimmed" size="lg" ta="center">There are no open lobbies</Text>
                    )
                }
            </Flex>

            <SimpleGrid my={20} cols={2} className={styles.lobbyGrid}>
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

            <Modal opened={rulesOpened} onClose={rulesClose}>
                <Rules />
            </Modal>

            <Modal.Root opened={errorOpened} onClose={errorClose}>
                <Modal.Overlay />
                <Modal.Content>
                    <Alert data-autofocus variant="outline" color="pink" title="Error" withCloseButton icon={<IconInfoCircle />} onClose={errorClose}>
                        This lobby can not be joined.
                    </Alert>
                </Modal.Content>
            </Modal.Root>

            <Footer />

        </Flex>
    )
}
