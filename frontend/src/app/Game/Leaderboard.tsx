'use client'

import { ThemeIcon, Table } from '@mantine/core';
import { Player as PlayerModel } from '../Models/Player';
import { useEffect, useState, useRef } from 'react';

export default function Leaderboard(props: { players: PlayerModel[] }) {
    const [playersSortedByPoints, setPlayersSortedByPoints] = useState<PlayerModel[]>();

    useEffect(() => {
        setPlayersSortedByPoints(props.players.sort((a: PlayerModel, b: PlayerModel) => { return (b.points ?? 0) - (a.points ?? 0) }));
    }, [props.players]);

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th></Table.Th>
                    <Table.Th>Username</Table.Th>
                    <Table.Th>Points</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>

                {playersSortedByPoints?.map((player, index) =>
                    <Table.Tr key={player.socketId}>
                        <Table.Td>
                            <ThemeIcon variant="light" size={33} radius="xl">
                                {index + 1}
                            </ThemeIcon>
                        </Table.Td>
                        <Table.Td>{player.username}</Table.Td>
                        <Table.Td>{player.points}</Table.Td>
                    </Table.Tr>
                )}

            </Table.Tbody>
        </Table>
    )
}
