'use client'

import styles from './lobby-list.module.css'

import { useEffect, useState, useRef } from 'react';

export default function LobbyList(props: {}) {
    const [lobbyList, setLobbyList] = useState<Array<number>>();



    useEffect(() => {
        fetch('http://localhost:3001/lobbies')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Handle the data from the response
                console.log('Lobbies:', data);
                setLobbyList(data);
            })
            .catch(error => {
                console.error('Error fetching lobbies:', error);
            });

    }, []);

    return (
        <>
            {lobbyList?.toString()}
        </>
    )
}
