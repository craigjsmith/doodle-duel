'use client'

import { Button, Center, Flex, Group,Switch, TextInput } from '@mantine/core';
import { useState } from 'react';

export default function LobbyCreator(props: { createLobby: (lobbyName: string, privateLobby: Boolean) => void }) {
    const [values, setValues] = useState<string[]>([]);
    const [lobbyName, setLobbyName] = useState('');

    const createLobby = () => {
        let isPrivate = values.includes("private");
        props.createLobby(lobbyName, isPrivate);
    }

    return (
        <>
            <Center>
                <Flex justify="flex-start" align="flex-start" direction="column">
                    <TextInput
                        size="s"
                        radius="xs"
                        type="text"
                        label="Lobby Name"
                        placeholder="My Lobby"
                        value={lobbyName}
                        onChange={(event) => { setLobbyName(event.target.value) }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && lobbyName) {
                                createLobby();
                            }
                        }}
                        data-autofocus
                    />

                    <Switch.Group
                        value={values}
                        onChange={setValues}
                        label="Private Lobby"
                        description="Lobby can only be joined via link"
                        mt="md"
                    >
                        <Group mt="xs">
                            <Switch value="private" />
                        </Group>
                    </Switch.Group>
                </Flex>
            </Center>

            <Group justify="center">
                <Button
                    variant="filled"
                    size="s"
                    radius="md"
                    my="lg"
                    disabled={!lobbyName}
                    onClick={() => { createLobby() }}
                >
                    Start
                </Button>
            </Group>
        </>

    )
}
