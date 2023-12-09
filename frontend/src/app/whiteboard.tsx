'use client'

import styles from './whiteboard.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Whiteboard(props: { image: any | undefined, draw: any, enable: boolean }) {
    const [ctx, setCtx] = useState<any>();
    const [loaded, setLoaded] = useState<any>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const CANVAS_SIZE = 500;
    var pos = { x: 0, y: 0 };

    useEffect(() => {
        load();
    }, [props.enable, props.image])

    useEffect(() => {
        if (canvasRef && canvasRef.current) {
            setLoaded(true);
            setCtx(canvasRef.current.getContext('2d'));

            canvasRef.current.addEventListener('mousemove', draw);
            canvasRef.current.addEventListener('mousedown', setPosition);
            canvasRef.current.addEventListener('mouseenter', setPosition);
            canvasRef.current.addEventListener('mouseup', save);
        }
    }, [loaded]);

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

    function save() {
        if (ctx) {
            props.draw(ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data);
        }
    }

    function load() {
        if (!props.image) {
            clear();
        } else {
            var array = new Uint8ClampedArray(props.image);
            ctx?.putImageData(new ImageData(array, 500, 500), 0, 0);
        }
    }

    function clear() {
        ctx?.clearRect(0, 0, 500, 500);
    }

    return (
        <canvas className={`${styles.canvas} ${props.enable ? styles.enabled : styles.disabled}`} ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
    )
}
