'use client'

import Image from 'next/image'
import styles from './whiteboard.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Whiteboard(props: { image: any | undefined, draw: any, username: string, currentArtist: string }) {
    const [ctx, setCtx] = useState<any>();
    const [state, setState] = useState<string>();
    const [enableDrawing, setEnableDrawing] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const CANVAS_SIZE = 500;

    //var img: any;

    useEffect(() => {
        if (props.username?.localeCompare(props.currentArtist)) {
            console.log("Not my turn");
            load();
            setEnableDrawing(false);
        } else {
            setEnableDrawing(true);
        }
    }, [props.image]);

    // useEffect(() => {
    //     if (enableDrawing) {
    //         setInterval(save, 1000);
    //     }
    // }, [enableDrawing]);

    useEffect(() => {
        if (canvasRef && canvasRef.current) {
            setCtx(canvasRef.current.getContext('2d'));
            //var ctx = canvasRef.current.getContext('2d');
            var pos = { x: 0, y: 0 };

            if (enableDrawing) {
                canvasRef.current.addEventListener('mousemove', draw);
                canvasRef.current.addEventListener('mousedown', setPosition);
                canvasRef.current.addEventListener('mouseenter', setPosition);
                canvasRef.current.addEventListener('mouseup', save);
            } else {
                canvasRef.current.removeEventListener('mousemove', draw);
                canvasRef.current.removeEventListener('mousedown', setPosition);
                canvasRef.current.removeEventListener('mouseenter', setPosition);
            }
        }

        function setPosition(e: any) {
            var left = 0;
            var top = 0;
            if (canvasRef && canvasRef.current) {
                left = canvasRef.current.getBoundingClientRect().left;
                top = canvasRef.current.getBoundingClientRect().top;
            }

            pos.x = e.clientX - left;
            pos.y = e.clientY - top;
        }

        function draw(e: any) {
            if (e.buttons !== 1) return;

            if (ctx) {
                ctx.beginPath();

                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#0000ff';

                ctx.moveTo(pos.x, pos.y); // from
                setPosition(e);
                ctx.lineTo(pos.x, pos.y); // to

                ctx.stroke();
            }
        }
    });

    function save() {
        if (ctx) {
            props.draw(ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data);
        }

        // if (canvasRef && canvasRef.current) {
        //     let canvasContext = canvasRef.current.getContext("2d")

        //     if (canvasContext) {
        //         props.draw(canvasContext.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data);
        //     }
        // }
    }

    function load() {
        if (ctx) {
            var array = new Uint8ClampedArray(props.image);

            ctx.putImageData(new ImageData(array, 500, 500), 0, 0);
        }

        // if (canvasRef && canvasRef.current) {
        //     let canvasContext = canvasRef.current.getContext("2d")

        //     if (canvasContext && props.image) {
        //         console.log(props.image);
        //         console.log("^");

        //         var array = new Uint8ClampedArray(props.image);

        //         canvasContext.putImageData(new ImageData(array, 500, 500), 0, 0);
        //     } else {
        //         console.log("error");
        //     }
        // }
    }

    return (
        <>
            {enableDrawing ? "enabled" : "disabled"}
            <canvas className={styles.canvas} ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
            <button onClick={save}>save</button>
            <button onClick={load}>load</button>
        </>
    )
}
