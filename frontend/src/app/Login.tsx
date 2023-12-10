'use client'

import { Button, Input, Group, Center } from '@mantine/core';

export default function Login(props: { setUsername: (username: string) => void, login: () => void }) {
    return (
        <Center>
            <Group>
                <Input
                    size="s"
                    radius="md"
                    type="text"
                    placeholder="Your username"
                    onChange={(event) => { props.setUsername(event.target.value) }}
                />

                <Button
                    variant="filled"
                    size="s"
                    radius="md"
                    my={15}
                    onClick={() => { props.login(); }}
                >
                    Go
                </Button>
            </Group>
        </Center>
    )
}
