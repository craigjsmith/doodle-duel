'use client'

import { Button, Container, CopyButton, Flex, Group, Input, List, Loader, rem, Text, ThemeIcon, Title } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { Player as PlayerModel } from '../Models/Player';
import styles from './lobby.module.css'

export default function Lobby(props: { lobbyId: number | null, lobbyName: string | undefined, players: PlayerModel[] | undefined, startGame: () => void | undefined }) {
    const URL = window.location.origin + "/?lobby=" + props.lobbyId;

    useEffect(() => {
        // Clear out URL params
        if (typeof window !== "undefined") {
            window.history.replaceState(null, '', '/');
        }
    }, []);

    return (
        <>
            <Flex>
                <div className={styles.topBar} key={'top'}>
                    <Title order={1} my={20}>{props.lobbyName}</Title>
                </div>
            </Flex>

            <Container>
                <Flex
                    mih={50}
                    gap="md"
                    justify="center"
                    align="center"
                    direction="column"
                    wrap="wrap"
                >

                    <Flex direction="column" align="center" my={50}>
                        <Text size="md" mb={4}>Share this link to invite players</Text>
                        <CopyButton value={URL}>
                            {({ copied, copy }) => (
                                <Group gap={0}>
                                    <Input
                                        variant='filled'
                                        radius={0}
                                        type="text"
                                        value={URL}
                                        className={styles.linkInput}
                                        onClick={() => { copy() }}
                                        mx={0}
                                        readOnly
                                    />

                                    <Button onClick={() => { copy() }} radius={0} mx={0}>
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                </Group>
                            )}
                        </CopyButton>
                    </Flex>

                    <List
                        spacing="xs"
                        size="sm"
                        center
                        icon={
                            <ThemeIcon variant="light" size={33} radius="xl">
                                <IconUser style={{ width: rem(16), height: rem(16) }} />
                            </ThemeIcon>
                        }
                    >
                        {props.players?.map((player) => <List.Item key={player.socketId}><Text size="xl">{player.username}</Text></List.Item>)}
                    </List>

                    {
                        (props.players?.length ?? 0) > 1 ?
                            <Button
                                variant="filled"
                                radius="xl"
                                my={40}
                                onClick={() => { props.startGame() }}
                            >
                                Start
                            </Button>
                            :
                            <Flex
                                my={40}
                                justify="center"
                                align="center"
                                direction="column">
                                <Loader type="dots" />
                                <Text size="md">Waiting for more players</Text>
                            </Flex>
                    }

                </Flex>
            </Container>
        </>
    )
}
