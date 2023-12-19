'use client'

import ColorButton from './ColorButton';
import { Player as PlayerModel } from '../Models/Player';
import { Image as ImageModel } from '../Models/Image';
import styles from './whiteboard.module.css'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

export default function Whiteboard({
    image,
    emitDrawing,
    enable,
    unusuableHeight,
    turn,
}: {
    image: ImageModel | undefined | null;
    emitDrawing: (img: Uint8ClampedArray | undefined) => void;
    enable: boolean;
    unusuableHeight: number;
    turn: PlayerModel | undefined;
}) {
    const CANVAS_SIZE = 500;
    const COLOR_SELECTOR_SIZE = 40 + 45;
    const COLORS = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C']

    const pos = useMemo(() => {
        return { x: 0, y: 0 };
    }, [])
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>();
    const [listenersInstalled, setListenersInstalled] = useState<boolean>(false);
    const [selectedColor, _setSelectedColor] = useState<string>(COLORS[0]);
    const [scaleFactor, _setScaleFactor] = useState<number>(1);

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

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const colorSwatchesRef = useRef<HTMLDivElement>(null);

    const scaleCanvasToScreen = useCallback(() => {
        let yPadding = 40;
        let xPadding = 20;
        let maxHeight = (window.visualViewport?.height ?? 0) - (unusuableHeight + (colorSwatchesRef.current?.clientHeight ?? 0) + yPadding);
        let maxWidth = window.innerWidth - (xPadding);
        let size = maxHeight < maxWidth ? maxHeight : maxWidth;
        setScaleFactor(size / CANVAS_SIZE);

        if (canvasRef && canvasRef.current) {
            canvasRef.current.style.transform = `scale(${size / CANVAS_SIZE})`;
            canvasRef.current.style.transformOrigin = `top center`;
        }
    }, [unusuableHeight])

    const setPosition = useCallback((e: MouseEvent | TouchEvent) => {
        var left = 0;
        var top = 0;
        if (canvasRef && canvasRef.current) {
            left = canvasRef.current.getBoundingClientRect().left;
            top = canvasRef.current.getBoundingClientRect().top;
        }

        if (window.TouchEvent && e instanceof TouchEvent) {
            pos.x = (e.changedTouches[0].clientX - left) / scaleFactorRef.current;
            pos.y = (e.changedTouches[0].clientY - top) / scaleFactorRef.current;
        } else if (window.MouseEvent && e instanceof MouseEvent) {
            pos.x = (e.clientX - left) / scaleFactorRef.current;
            pos.y = (e.clientY - top) / scaleFactorRef.current;
        }
    }, [pos])

    const draw = useCallback((e: MouseEvent | TouchEvent) => {
        e.preventDefault();

        if (window.MouseEvent && e instanceof MouseEvent && e.buttons !== 1) return;

        if (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.strokeStyle = selectedColorRef.current;

            ctx.moveTo(pos.x, pos.y); // from
            setPosition(e);
            ctx.lineTo(pos.x, pos.y); // to

            ctx.stroke();
        }
    }, [ctx, pos, setPosition])

    const save = useCallback(() => {
        emitDrawing(ctx?.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data);
    }, [ctx, emitDrawing])

    const clear = useCallback(() => {
        ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }, [ctx])

    const load = useCallback(() => {
        if (!image) {
            clear();
        } else if (!enable && turn?.socketId === image.artist) {
            var array = new Uint8ClampedArray(image.img);
            ctx?.putImageData(new ImageData(array, CANVAS_SIZE, CANVAS_SIZE), 0, 0);
        }
    }, [clear, ctx, enable, image, turn])

    useEffect(() => {
        // Save whiteboard 2 times per second.
        const interval = setInterval(() => {
            if (enable) {
                save();
            }
        }, 500);

        return () => clearInterval(interval);
    }, [enable, save]);

    useEffect(() => {
        // Update scaling when unusable height changes
        scaleCanvasToScreen();
    }, [scaleCanvasToScreen])

    useEffect(() => {
        // Update canvas image when recieved
        load();
    }, [image, load])

    useEffect(() => {
        let canvas = canvasRef.current;

        setListenersInstalled(true);
        setCtx(canvas?.getContext('2d', { willReadFrequently: true }));

        window.visualViewport?.addEventListener("resize", scaleCanvasToScreen);

        // Touch events
        canvas?.addEventListener('touchmove', draw);
        canvas?.addEventListener('touchstart', setPosition);
        canvas?.addEventListener('touchend', setPosition);

        // Mouse events
        canvas?.addEventListener('mousemove', draw);
        canvas?.addEventListener('mousedown', setPosition);
        canvas?.addEventListener('mouseenter', setPosition);

        return () => {
            canvas?.removeEventListener('touchmove', draw);
            canvas?.removeEventListener('touchstart', setPosition);
            canvas?.removeEventListener('touchend', setPosition);

            canvas?.removeEventListener('mousemove', draw);
            canvas?.removeEventListener('mousedown', setPosition);
            canvas?.removeEventListener('mouseenter', setPosition);
        }
    }, [listenersInstalled, draw, setPosition, scaleCanvasToScreen]);

    return (
        <>
            {enable ?
                <div className={styles.colorSwatches} ref={colorSwatchesRef}>
                    {
                        COLORS.map((color) =>
                            <ColorButton key={color} color={color} selected={color === selectedColor} onClick={() => { setSelectedColor(color) }} />
                        )
                    }
                </div> : undefined}

            <div className={styles.canvasContainer}>
                <canvas className={`${styles.canvas} ${enable ? styles.enabled : styles.disabled} `} ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE - COLOR_SELECTOR_SIZE} />
            </div>
        </>
    )
}
