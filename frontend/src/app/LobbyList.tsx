'use client'

import styles from './lobby-list.module.css'

import { useEffect, useState, useRef } from 'react';

export default function LobbyList(props: { setLobby: (lobbyId: number) => void }) {
    const [lobbyList, setLobbyList] = useState<Array<number>>();

    useEffect(() => {
        getLobbies();
    }, []);

    const getLobbies = () => {
        fetch('http://192.168.0.24:3001/lobbies')
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
    }

    const createLobby = () => {
        console.log("createLobby");

        fetch('http://192.168.0.24:3001/createLobby', { method: "POST", })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Refresh Lobby List
                props.setLobby(data.newLobbyId);
            })
            .catch(error => {
                console.error('Error fetching lobbies:', error);
            });
    }

    return (
        <>
            <h1>Open Lobbies</h1>

            <table>
                <tr>
                    <th>Lobby</th>
                </tr>
                {lobbyList?.map((lobby) =>
                    <tr key={lobby} onClick={() => { props.setLobby(lobby) }}>
                        <td>{lobby}</td>
                    </tr>
                    // <li key={lobby} onClick={() => { props.setLobby(lobby) }}>{lobby}</li>
                )}
            </table>

            <button onClick={() => { createLobby(); }}>New Lobby</button>
        </>
    )
}
