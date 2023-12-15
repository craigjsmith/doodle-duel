'use client'

import { Button, Switch, Group, Center, Flex } from '@mantine/core';
import { useState } from 'react';

export default function LobbyCreator(props: { createLobby: (privateLobby: Boolean) => void }) {
    const [checked, setChecked] = useState(false);

    return (
        <Center>
            <Flex justify="flex-start" align="center" direction="column">
                <Switch
                    label="Private Lobby"
                    description="Lobby can only be joined via link"
                    checked={checked}
                    onChange={(event) => setChecked(event.currentTarget.checked)}
                    my={15}
                />

                <Button
                    variant="filled"
                    size="s"
                    radius="md"
                    my={15}
                    onClick={() => { props.createLobby(checked) }}
                >
                    Start
                </Button>
            </Flex>
        </Center>
    )
}
