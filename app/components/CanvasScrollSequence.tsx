"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";

export type CanvasScrollSequenceHandle = {
  seek: (progress: number) => void;
};

type Props = {
  className?: string;
  desktopPath: string;
  frameCount: number;
  mobilePath: string;
  onError: () => void;
  onReady: () => void;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const CanvasScrollSequence = forwardRef<CanvasScrollSequenceHandle, Props>(function CanvasScrollSequence(
  { className, desktopPath, frameCount, mobilePath, onError, onReady },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(0);
  const previousTargetRef = useRef(0);
  const drawFrameRef = useRef(0);
  const resizeFrameRef = useRef(0);
  const cacheRef = useRef(new Map<number, HTMLImageElement>());
  const inflightRef = useRef(new Set<number>());
  const queuedRef = useRef<number[]>([]);
  const activeLoadsRef = useRef(0);
  const sourcePathRef = useRef(desktopPath);
  const disposedRef = useRef(false);
  const readyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  useImperativeHandle(ref, () => ({
    seek(progress) {
      const target = clamp(Math.round(progress * (frameCount - 1)), 0, frameCount - 1);
      const direction = Math.sign(target - previousTargetRef.current) || 1;
      previousTargetRef.current = target;
      targetRef.current = target;
      const wanted = [
        target,
        target + direction,
        target + direction * 2,
        target - direction,
        target + direction * 4,
        target - direction * 2,
        target + direction * 7,
      ]
        .filter((index) => index >= 0 && index < frameCount);
      queuedRef.current = queuedRef.current.filter((index) => Math.abs(index - target) <= 7);
      wanted.reverse().forEach((index) => enqueueRef.current(index, true));
      scheduleDrawRef.current();
    },
  }), [frameCount]);

  const drawRef = useRef(() => {
    drawFrameRef.current = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const target = targetRef.current;
    let image = cacheRef.current.get(target);
    if (image) {
      cacheRef.current.delete(target);
      cacheRef.current.set(target, image);
    }
    if (!image) {
      let nearestDistance = Number.POSITIVE_INFINITY;
      cacheRef.current.forEach((candidate, index) => {
        const distance = Math.abs(index - target);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          image = candidate;
        }
      });
    }
    if (!image) return;

    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = canvas.width / canvas.height;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    if (sourceRatio > canvasRatio) {
      sourceWidth = image.naturalHeight * canvasRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / canvasRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
  });

  const scheduleDrawRef = useRef(() => {
    if (!drawFrameRef.current) drawFrameRef.current = requestAnimationFrame(drawRef.current);
  });

  const trimCacheRef = useRef(() => {
    const cache = cacheRef.current;
    if (cache.size <= 18) return;
    const protectedFrames = new Set([targetRef.current, targetRef.current - 1, targetRef.current + 1]);
    for (const [index, image] of cache) {
      if (cache.size <= 18) break;
      if (protectedFrames.has(index)) continue;
      cache.delete(index);
      image.src = "";
    }
  });

  const pumpRef = useRef(() => {
    if (disposedRef.current) return;
    while (activeLoadsRef.current < 4 && queuedRef.current.length) {
      const index = queuedRef.current.shift()!;
      if (cacheRef.current.has(index) || inflightRef.current.has(index)) continue;
      activeLoadsRef.current += 1;
      inflightRef.current.add(index);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        activeLoadsRef.current -= 1;
        inflightRef.current.delete(index);
        if (!disposedRef.current) {
          cacheRef.current.set(index, image);
          if (!readyRef.current) {
            readyRef.current = true;
            onReadyRef.current();
          }
          trimCacheRef.current();
          scheduleDrawRef.current();
          pumpRef.current();
        }
      };
      image.onerror = () => {
        activeLoadsRef.current -= 1;
        inflightRef.current.delete(index);
        if (!disposedRef.current) {
          if (!readyRef.current) onErrorRef.current();
          pumpRef.current();
        }
      };
      image.src = `${sourcePathRef.current}/frame-${String(index + 1).padStart(4, "0")}.webp`;
    }
  });

  const enqueueRef = useRef((index: number, priority = false) => {
    if (
      index < 0 ||
      index >= frameCount ||
      cacheRef.current.has(index) ||
      inflightRef.current.has(index) ||
      queuedRef.current.includes(index)
    ) return;
    if (priority) queuedRef.current.unshift(index);
    else queuedRef.current.push(index);
    pumpRef.current();
  });

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    disposedRef.current = false;
    sourcePathRef.current = matchMedia("(max-width: 700px)").matches ? mobilePath : desktopPath;

    const resize = () => {
      resizeFrameRef.current = 0;
      const bounds = canvas.getBoundingClientRect();
      const dprLimit = matchMedia("(max-width: 700px)").matches ? 1.35 : 1.5;
      const dpr = Math.min(devicePixelRatio || 1, dprLimit);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      scheduleDrawRef.current();
    };
    const observer = new ResizeObserver(() => {
      if (!resizeFrameRef.current) resizeFrameRef.current = requestAnimationFrame(resize);
    });
    observer.observe(canvas);
    resize();
    enqueueRef.current(0, true);
    [1, 2, 4, 8].forEach((index) => enqueueRef.current(index));

    return () => {
      disposedRef.current = true;
      observer.disconnect();
      cancelAnimationFrame(drawFrameRef.current);
      cancelAnimationFrame(resizeFrameRef.current);
      queuedRef.current = [];
      inflightRef.current.clear();
      cacheRef.current.forEach((image) => { image.src = ""; });
      cacheRef.current.clear();
    };
  }, [desktopPath, mobilePath]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
});

export default CanvasScrollSequence;
