'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Image as ImageModel } from '../Models/Image';
import { Player as PlayerModel } from '../Models/Player';
import ColorButton from './ColorButton';
import styles from './whiteboard.module.css'

export default function Whiteboard({
    image,
    emitDrawing,
    enable,
    unusuableHeight,
    turn
}: {
    image: ImageModel | undefined | null;
    emitDrawing: (img: string | undefined) => void;
    enable: boolean;
    unusuableHeight: number;
    turn: PlayerModel | undefined;
}) {
    const CANVAS_SIZE = 500;
    const COLORS = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#DA77F2', '#073B4C']

    const pos = useMemo(() => { return { x: 0, y: 0 } }, [])
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>();
    const [listenersInstalled, setListenersInstalled] = useState<boolean>(false);
    const [selectedColor, _setSelectedColor] = useState<string>(COLORS[0]);
    const [scaleFactor, _setScaleFactor] = useState<number>(1);

    // A blank 500x500px png
    let defaultImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAQAAABh3xcBAAAEM0lEQVR42u3TMQ0AAAzDsJU/6Z3lUNkQIiUHzIsEYHTA6IDRAaMDRgeMDhgdMDoYHTA6YHTA6IDRAaMDRgeMDkYHjA4YHTA6YHTA6IDRAaOD0QGjA0YHjA4YHTA6YHTA6IDRweiA0QGjA0YHjA4YHTA6YHQwOmB0wOiA0QGjA0YHjA4YHYwOGB0wOmB0wOiA0QGjA0YHjA5GB4wOGB0wOmB0wOiA0QGjg9EBowNGB4wOGB0wOmB0wOhgdMDogNEBowNGB4wOGB0wOmB0MDpgdMDogNEBowNGB4wOGB2MDhgdMDpgdMDogNEBowNGB6MDRgeMDhgdMDpgdMDogNEBo4PRAaMDRgeMDhgdMDpgdMDoYHTA6IDRAaMDRgeMDhgdMDoYHTA6YHTA6IDRAaMDRgeMDhgdjA4YHTA6YHTA6IDRAaMDRgejA0YHjA4YHTA6YHTA6IDRweiA0QGjA0YHjA4YHTA6YHTA6GB0wOiA0QGjA0YHjA4YHTA6GB0wOmB0wOiA0QGjA0YHjA5GB4wOGB0wOmB0wOiA0QGjA0YHowNGB4wOGB0wOmB0wOiA0cHogNEBowNGB4wOGB0wOmB0MDpgdMDogNEBowNGB4wOGB0wOhgdMDpgdMDogNEBowNGB4wORgeMDhgdMDpgdMDogNEBo4PRAaMDRgeMDhgdMDpgdMDogNHB6IDRAaMDRgeMDhgdMDpgdDA6YHTA6IDRAaMDRgeMDhgdjA4YHTA6YHTA6IDRAaMDRgejSwBGB4wOGB0wOmB0wOiA0QGjg9EBowNGB4wOGB0wOmB0wOhgdMDogNEBowNGB4wOGB0wOhgdMDpgdMDogNEBowNGB4wOGB2MDhgdMDpgdMDogNEBowNGB6MDRgeMDhgdMDpgdMDogNHB6IDRAaMDRgeMDhgdMDpgdMDoYHTA6IDRAaMDRgeMDhgdMDoYHTA6YHTA6IDRAaMDRgeMDkYHjA4YHTA6YHTA6IDRAaMDRgejA0YHjA4YHTA6YHTA6IDRweiA0QGjA0YHjA4YHTA6YHQwOmB0wOiA0QGjA0YHjA4YHTA6GB0wOmB0wOiA0QGjA0YHjA5GB4wOGB0wOmB0wOiA0QGjg9EBowNGB4wOGB0wOmB0wOiA0cHogNEBowNGB4wOGB0wOmB0MDpgdMDogNEBowNGB4wOGB2MDhgdMDpgdMDogNEBowNGB4wORgeMDhgdMDpgdMDogNEBo4PRAaMDRgeMDhgdMDpgdMDoYHTA6IDRAaMDRgeMDhgdMDpgdDA6YHTA6IDRAaMDRgeMDhgdjA4YHTA6YHTA6IDRAaMDRgejA0YHjA4YHTA6YHTA6IDRAaOD0QGjA0YHjA4YHTA6YHTA6GB0wOiA0QGjA0YHjA4YHTA6GB0wOmB0wOiA0QGjA0YHjA4YHYwOGB0wOmB0wOiA0QGjA/UmtQH1f8NoAQAAAABJRU5ErkJggg=="
    const [dummyCanvas, setDummyCanvas] = useState<any>(defaultImg);

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
    const dummyCanvasRef = useRef<HTMLImageElement>(null);

    const scaleCanvasToScreen = useCallback(() => {
        let padding = 20;
        let maxHeight = (window.visualViewport?.height ?? 0) - (unusuableHeight + padding);
        let maxWidth = window.innerWidth - (padding);
        let size = maxHeight < maxWidth ? maxHeight : maxWidth;
        setScaleFactor(size / CANVAS_SIZE);

        if (canvasRef && canvasRef.current) {
            canvasRef.current.style.transform = `scale(${size / CANVAS_SIZE})`;
            canvasRef.current.style.transformOrigin = `top center`;
        }

        if (dummyCanvasRef && dummyCanvasRef.current) {
            dummyCanvasRef.current.style.transform = `scale(${size / CANVAS_SIZE})`;
            dummyCanvasRef.current.style.transformOrigin = `top center`;
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
        let jpg = canvasRef.current?.toDataURL("image/png", 0.1);
        emitDrawing(jpg);
    }, [emitDrawing])

    const clear = useCallback(() => {
        ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        setDummyCanvas(defaultImg);
    }, [ctx, defaultImg])

    const load = useCallback(() => {
        if (!image) {
            clear();
        } else if (turn?.socketId === image.artist) {
            // Don't load if incoming drawing from a previous round
            setDummyCanvas(image.img);
        }
    }, [clear, image, turn])

    useEffect(() => {
        // Save whiteboard 4 times per second.
        const interval = setInterval(() => {
            if (enable) {
                save();
            }
        }, 250);

        return () => clearInterval(interval);
    }, [enable, save]);

    useEffect(() => {
        // Scale canvas to screen on load
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
                <div className={styles.colorSwatches}>
                    {
                        COLORS.map((color) =>
                            <ColorButton key={color} color={color} selected={color === selectedColor} onClick={() => { setSelectedColor(color) }} />
                        )
                    }
                </div> : undefined}

            <div className={styles.canvasContainer}>
                <canvas className={`${enable ? styles.drawableCanvas : styles.disabled}`} ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />

                <img src={dummyCanvas} ref={dummyCanvasRef} className={`${enable ? styles.disabled : styles.canvas}`} alt="Canvas" />
            </div>
        </>
    )
}
