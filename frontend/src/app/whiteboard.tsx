'use client'

import styles from './whiteboard.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Whiteboard(props: { image: any | undefined, draw: any, enable: boolean }) {
    const [ctx, setCtx] = useState<any>();
    const [loaded, setLoaded] = useState<any>();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const CANVAS_SIZE = 500;
    var pos = { x: 0, y: 0 };

    const [lastSavedTimestamp, _setLastSavedTimestamp] = useState<any>(0);

    const lastSavedTimestampRef = useRef(lastSavedTimestamp);
    const setLastSavedTimestamp = (data: number) => {
        lastSavedTimestampRef.current = data;
        _setLastSavedTimestamp(data);
    };

    const [scaleFactor, _setScaleFactor] = useState<number>(1);

    const scaleFactorRef = useRef(scaleFactor);
    const setScaleFactor = (data: number) => {
        scaleFactorRef.current = data;
        _setScaleFactor(data);
    };

    function scaleCanvasToScreen() {
        if (canvasRef && canvasRef.current) {
            let desiredDimension = window.innerWidth * 0.9;
            let limitingDimension = window.innerHeight * 0.7;
            let size = limitingDimension < desiredDimension ? limitingDimension : desiredDimension;
            // let smallestDimension = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
            // let size = smallestDimension * 0.9;
            setScaleFactor(size / 500);
            canvasRef.current.style.transform = `scale(${size / 500})`;
            canvasRef.current.style.transformOrigin = `top center`;
        }
    }

    useEffect(() => {
        scaleCanvasToScreen();
    }, [])

    useEffect(() => {
        load();
    }, [props.image])

    useEffect(() => {
        if (canvasRef && canvasRef.current) {
            setLoaded(true);
            setCtx(canvasRef.current.getContext('2d'));

            window.addEventListener("resize", scaleCanvasToScreen);

            canvasRef.current.addEventListener('touchmove', drawTouch);
            canvasRef.current.addEventListener('touchmove', save);
            canvasRef.current.addEventListener('touchstart', setPositionTouch);
            canvasRef.current.addEventListener('touchend', setPositionTouch);

            canvasRef.current.addEventListener('mousemove', draw);
            canvasRef.current.addEventListener('mousemove', save);
            canvasRef.current.addEventListener('mousedown', setPosition);
            canvasRef.current.addEventListener('mouseenter', setPosition);
        }

        return () => {

        }
    }, [loaded]);

    function setPosition(e: any) {
        var left = 0;
        var top = 0;
        if (canvasRef && canvasRef.current) {
            left = canvasRef.current.getBoundingClientRect().left;
            top = canvasRef.current.getBoundingClientRect().top;
        }

        pos.x = (e.clientX - left) / scaleFactorRef.current;
        pos.y = (e.clientY - top) / scaleFactorRef.current;
    }

    function setPositionTouch(e: any) {
        var left = 0;
        var top = 0;
        if (canvasRef && canvasRef.current) {
            left = canvasRef.current.getBoundingClientRect().left;
            top = canvasRef.current.getBoundingClientRect().top;
        }

        pos.x = (e.changedTouches[0].clientX - left) / scaleFactorRef.current;
        pos.y = (e.changedTouches[0].clientY - top) / scaleFactorRef.current;
    }

    function draw(e: any) {
        e.preventDefault();
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

    function drawTouch(e: any) {
        e.preventDefault();
        // if (e.buttons !== 1) return;

        if (ctx) {
            ctx.beginPath();

            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#0000ff';

            ctx.moveTo(pos.x, pos.y); // from
            setPositionTouch(e);
            ctx.lineTo(pos.x, pos.y); // to

            ctx.stroke();
        }
    }

    function save() {
        var date = new Date();

        // Throtle emiting image to a max of 10 times per second
        if (ctx && (date.getTime() - lastSavedTimestampRef.current) > 100) {
            setLastSavedTimestamp(date.getTime());
            props.draw(ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data);
        }
    }

    function load() {
        if (!props.image) {
            clear();
        } else if (!props.enable) {
            // Only update whiteboard if you're not the artist
            var array = new Uint8ClampedArray(props.image);
            ctx?.putImageData(new ImageData(array, 500, 500), 0, 0);
        }
    }

    function clear() {
        ctx?.clearRect(0, 0, 500, 500);
    }

    return (
        <div className={styles.canvasContainer}>
            <canvas className={`${styles.canvas} ${props.enable ? styles.enabled : styles.disabled} `} ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
        </div>
    )
}
