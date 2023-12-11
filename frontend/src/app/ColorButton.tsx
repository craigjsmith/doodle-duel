'use client'

import { ColorSwatch, CheckIcon, rem } from '@mantine/core';

import { useState } from 'react';

export default function ColorButton(props: { color: string, selected: boolean, onClick: () => void }) {
    // const [checked, setChecked] = useState(true);

    return (
        <ColorSwatch
            component="button"
            color={props.color}
            onClick={() => {
                // setChecked((c) => !c);
                props.onClick();
            }}
            style={{ color: '#fff', cursor: 'pointer' }}
            mx={5}
        >
            {props.selected && <CheckIcon style={{ width: rem(12), height: rem(12) }} />}
        </ColorSwatch>
    )
}
