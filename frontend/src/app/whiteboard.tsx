'use client'

import styles from './whiteboard.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Whiteboard(props: { image: any | undefined, draw: any, enable: boolean, unusuableHeight: number }) {
    const CANVAS_SIZE = 500;
    var pos = { x: 0, y: 0 };

    const [ctx, setCtx] = useState<any>();
    const [listenersInstalled, setListenersInstalled] = useState<boolean>(false);
    const [lastSavedTimestamp, _setLastSavedTimestamp] = useState<any>(0);
    const [scaleFactor, _setScaleFactor] = useState<number>(1);

    const lastSavedTimestampRef = useRef(lastSavedTimestamp);
    const setLastSavedTimestamp = (data: number) => {
        lastSavedTimestampRef.current = data;
        _setLastSavedTimestamp(data);
    };

    const scaleFactorRef = useRef(scaleFactor);
    const setScaleFactor = (data: number) => {
        scaleFactorRef.current = data;
        _setScaleFactor(data);
    };

    const [unusuableHeight, _setUnusuableHeight] = useState<number>(0);

    const unusuableHeightRef = useRef(unusuableHeight);
    const setUnusuableHeight = (data: number) => {
        unusuableHeightRef.current = data;
        _setUnusuableHeight(data);
    };

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setUnusuableHeight(props.unusuableHeight)
    }, [props.unusuableHeight])

    useEffect(() => {
        // Update scaling when unusable height changes
        scaleCanvasToScreen();
    }, [props.unusuableHeight])

    useEffect(() => {
        // Update canvas image when recieved
        load();
    }, [props.image])

    useEffect(() => {
        if (canvasRef && canvasRef.current) {
            setListenersInstalled(true);
            setCtx(canvasRef.current.getContext('2d'));

            window.visualViewport?.addEventListener("resize", scaleCanvasToScreen);

            // Touch events
            canvasRef.current.addEventListener('touchmove', drawTouch);
            canvasRef.current.addEventListener('touchmove', save);
            canvasRef.current.addEventListener('touchstart', setPositionTouch);
            canvasRef.current.addEventListener('touchend', setPositionTouch);

            // Mouse events
            canvasRef.current.addEventListener('mousemove', draw);
            canvasRef.current.addEventListener('mousemove', save);
            canvasRef.current.addEventListener('mousedown', setPosition);
            canvasRef.current.addEventListener('mouseenter', setPosition);
        }

        return () => {
            canvasRef.current?.removeEventListener('touchmove', drawTouch);
            canvasRef.current?.removeEventListener('touchmove', save);
            canvasRef.current?.removeEventListener('touchstart', setPositionTouch);
            canvasRef.current?.removeEventListener('touchend', setPositionTouch);

            canvasRef.current?.removeEventListener('mousemove', draw);
            canvasRef.current?.removeEventListener('mousemove', save);
            canvasRef.current?.removeEventListener('mousedown', setPosition);
            canvasRef.current?.removeEventListener('mouseenter', setPosition);
        }
    }, [listenersInstalled]);

    function scaleCanvasToScreen() {
        let padding = 35;
        let maxHeight = (window.visualViewport?.height ?? 0) - (unusuableHeightRef.current + padding);
        let maxWidth = window.innerWidth - (padding * 2);
        let size = maxHeight < maxWidth ? maxHeight : maxWidth;
        setScaleFactor(size / CANVAS_SIZE);

        if (canvasRef && canvasRef.current) {
            canvasRef.current.style.transform = `scale(${size / CANVAS_SIZE})`;
            canvasRef.current.style.transformOrigin = `top center`;
        }
    }

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
            ctx?.putImageData(new ImageData(array, CANVAS_SIZE, CANVAS_SIZE), 0, 0);
        }
    }

    function clear() {
        ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    return (
        <div className={styles.canvasContainer}>
            <canvas className={`${styles.canvas} ${props.enable ? styles.enabled : styles.disabled} `} ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
        </div>
    )
}
