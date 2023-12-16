'use client'

import ColorButton from './ColorButton';
import { Player as PlayerModel } from '../Models/Player';
import styles from './whiteboard.module.css'

import { useEffect, useState, useRef } from 'react';

export default function Whiteboard(props: { image: any | undefined, draw: any, enable: boolean, unusuableHeight: number, turn: PlayerModel | undefined, }) {
    const CANVAS_SIZE = 500;
    const COLOR_SELECTOR_SIZE = 40 + 45;
    const COLORS = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C']

    var pos = { x: 0, y: 0 };

    const [ctx, setCtx] = useState<any>();
    const [listenersInstalled, setListenersInstalled] = useState<boolean>(false);
    const [selectedColor, _setSelectedColor] = useState<string>(COLORS[0]);
    const [scaleFactor, _setScaleFactor] = useState<number>(1);
    const [unusuableHeight, _setUnusuableHeight] = useState<number>(0);

    const selectedColorRef = useRef(selectedColor);
    const setSelectedColor = (data: string) => {
        selectedColorRef.current = data;
        _setSelectedColor(data);
    };

    const scaleFactorRef = useRef(scaleFactor);
    const setScaleFactor = (data: number) => {
        scaleFactorRef.current = data;
        _setScaleFactor(data);
    };

    const unusuableHeightRef = useRef(unusuableHeight);
    const setUnusuableHeight = (data: number) => {
        unusuableHeightRef.current = data;
        _setUnusuableHeight(data);
    };

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const colorSwatchesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (props.enable) {
                save();
            }
        }, 500);

        return () => clearInterval(interval);
    }, [props.enable]);

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
            canvasRef.current.addEventListener('touchstart', setPositionTouch);
            canvasRef.current.addEventListener('touchend', setPositionTouch);

            // Mouse events
            canvasRef.current.addEventListener('mousemove', draw);
            canvasRef.current.addEventListener('mousedown', setPosition);
            canvasRef.current.addEventListener('mouseenter', setPosition);
        }

        return () => {
            canvasRef.current?.removeEventListener('touchmove', drawTouch);
            canvasRef.current?.removeEventListener('touchstart', setPositionTouch);
            canvasRef.current?.removeEventListener('touchend', setPositionTouch);

            canvasRef.current?.removeEventListener('mousemove', draw);
            canvasRef.current?.removeEventListener('mousedown', setPosition);
            canvasRef.current?.removeEventListener('mouseenter', setPosition);
        }
    }, [listenersInstalled]);

    function scaleCanvasToScreen() {
        let yPadding = 40;
        let xPadding = 20;
        let maxHeight = (window.visualViewport?.height ?? 0) - (unusuableHeightRef.current + (colorSwatchesRef.current?.clientHeight ?? 0) + yPadding);
        let maxWidth = window.innerWidth - (xPadding);
        let size = maxHeight < maxWidth ? maxHeight : maxWidth;
        setScaleFactor(size / CANVAS_SIZE);

        if (canvasRef && canvasRef.current) {
            canvasRef.current.style.transform = `scale(${size / CANVAS_SIZE})`;
            canvasRef.current.style.transformOrigin = `top center`;
        }
    }

    function setPosition(e: any, isTouch: boolean = false) {
        var left = 0;
        var top = 0;
        if (canvasRef && canvasRef.current) {
            left = canvasRef.current.getBoundingClientRect().left;
            top = canvasRef.current.getBoundingClientRect().top;
        }

        if (isTouch) {
            pos.x = (e.changedTouches[0].clientX - left) / scaleFactorRef.current;
            pos.y = (e.changedTouches[0].clientY - top) / scaleFactorRef.current;
        } else {
            pos.x = (e.clientX - left) / scaleFactorRef.current;
            pos.y = (e.clientY - top) / scaleFactorRef.current;
        }
    }

    function draw(e: any, isTouch: boolean = false) {
        e.preventDefault();

        if (!isTouch && e.buttons !== 1) return;

        if (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.strokeStyle = selectedColorRef.current;

            ctx.moveTo(pos.x, pos.y); // from
            setPosition(e, isTouch);
            ctx.lineTo(pos.x, pos.y); // to

            ctx.stroke();
        }
    }

    // Defining this function prevents passing anonymous function to action listener, which cant be unmounted
    function setPositionTouch(e: any) {
        setPosition(e, true);
    }

    // Defining this function prevents passing anonymous function to action listener, which cant be unmounted
    function drawTouch(e: any) {
        draw(e, true);
    }

    function save() {
        props.draw(ctx?.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data);
    }

    function load() {
        if (!props.image) {
            clear();
        } else if (!props.enable && !props.turn?.socketId.localeCompare(props.image.artist)) {
            // Only update whiteboard if you're not the artist
            var array = new Uint8ClampedArray(props.image.img);
            ctx?.putImageData(new ImageData(array, CANVAS_SIZE, CANVAS_SIZE), 0, 0);
        }
    }

    function clear() {
        ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    return (
        <>
            {props.enable ?
                <div className={styles.colorSwatches} ref={colorSwatchesRef}>
                    {
                        COLORS.map((color) =>
                            <ColorButton key={color} color={color} selected={!color.localeCompare(selectedColor)} onClick={() => { setSelectedColor(color) }} />
                        )
                    }
                </div> : undefined}

            <div className={styles.canvasContainer}>
                <canvas className={`${styles.canvas} ${props.enable ? styles.enabled : styles.disabled} `} ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE - COLOR_SELECTOR_SIZE} />
            </div>
        </>
    )
}
