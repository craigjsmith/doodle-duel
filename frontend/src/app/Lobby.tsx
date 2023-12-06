'use client'

import styles from './lobby-list.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Lobby(props: { lobbyId: number | null, players: Array<Array<string>> | undefined, startGame: () => void | undefined }) {
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
            <h1>{`Lobby: ${props.lobbyId}`}</h1>

            {console.log('PLAYERS')}
            {console.log(props.players)}

            <h2>Players</h2>
            <ul>
                {props.players?.map((player) => <li key={player[1]}>{player[1]}</li>)}
            </ul>

            <button onClick={() => { props.startGame() }}>Start</button>
        </>
    )
}
