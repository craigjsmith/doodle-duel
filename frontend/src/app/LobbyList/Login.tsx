'use client'

import { Button, Center, Group, TextInput } from '@mantine/core';
import { useEffect, useRef } from 'react';

export default function Login(props: { username: string, setUsername: (username: string) => void, login: () => void }) {
    const usernameFieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        usernameFieldRef.current?.focus();
    })

    return (
        <Center>
            <Group>
                <TextInput
                    size="s"
                    radius="md"
                    type="text"
                    placeholder="Your username"
                    value={props.username}
                    onChange={(event) => { props.setUsername(event.target.value) }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && props.username) {
                            props.login();
                        }
                    }}
                    ref={usernameFieldRef}
                    data-autofocus
                />

                <Button
                    variant="filled"
                    size="s"
                    radius="md"
                    my={15}
                    onClick={() => { props.login(); }}
                    disabled={!props.username?.length}
                >
                    Go
                </Button>
            </Group>
        </Center>
    )
}
