'use client'

import { Button, Center,Group, Input } from '@mantine/core';

export default function Login(props: { username: string, setUsername: (username: string) => void, login: () => void }) {
    return (
        <Center>
            <Group>
                <Input
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
