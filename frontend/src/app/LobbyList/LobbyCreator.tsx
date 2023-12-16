'use client'

import { Button, Switch, TextInput, Center, Flex, Group } from '@mantine/core';
import { useState } from 'react';

export default function LobbyCreator(props: { createLobby: (lobbyName: string, privateLobby: Boolean) => void }) {
    const [checked, setChecked] = useState(false);
    const [lobbyName, setLobbyName] = useState('');

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
                                props.createLobby(lobbyName, checked);
                            }
                        }}
                    />

                    <Switch.Group
                        label="Private Lobby"
                        description="Lobby can only be joined via link"
                        mt="md"
                    >
                        <Group mt="xs">
                            <Switch
                                // label="Private Lobby"
                                value="private"
                                checked={checked}
                                onChange={(event) => setChecked(event.currentTarget.checked)}
                            />
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
                    onClick={() => { props.createLobby(lobbyName, checked) }}
                >
                    Start
                </Button>
            </Group>
        </>

    )
}
