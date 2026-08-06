import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';

type GesturePhase = 'idle' | 'vertical' | 'horizontal';

export interface UseLGestureOptions {
  onGestureDetected?: () => void;
  enabled?: boolean;
  minimumStrokeDistance?: number;
  gestureTimeout?: number;
}

export interface LGestureHandlers {
  enabled: boolean;
  reset: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
}

interface Point {
  x: number;
  y: number;
}

export default function useLGesture({
  onGestureDetected,
  enabled = true,
  minimumStrokeDistance = 48,
  gestureTimeout = 1800,
}: UseLGestureOptions = {}): LGestureHandlers {
  const phaseRef = useRef<GesturePhase>('idle');
  const pointerIdRef = useRef<number | null>(null);
  const startPointRef = useRef<Point | null>(null);
  const verticalEndPointRef = useRef<Point | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isCompletingRef = useRef(false);

  const clearGestureTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearGestureTimer();
    phaseRef.current = 'idle';
    pointerIdRef.current = null;
    startPointRef.current = null;
    verticalEndPointRef.current = null;
    isCompletingRef.current = false;
  }, [clearGestureTimer]);

  const startGestureTimer = useCallback(() => {
    clearGestureTimer();

    timeoutRef.current = window.setTimeout(() => {
      reset();
    }, gestureTimeout);
  }, [clearGestureTimer, gestureTimeout, reset]);

  const completeGesture = useCallback(() => {
    if (isCompletingRef.current) return;

    isCompletingRef.current = true;
    clearGestureTimer();

    if (typeof onGestureDetected === 'function') {
      onGestureDetected();
    }

    window.setTimeout(() => {
      reset();
    }, 0);
  }, [clearGestureTimer, onGestureDetected, reset]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.isPrimary === false) return;

      reset();

      pointerIdRef.current = event.pointerId;
      startPointRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      phaseRef.current = 'vertical';

      event.currentTarget.setPointerCapture?.(event.pointerId);
      startGestureTimer();
    },
    [enabled, reset, startGestureTimer]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      if (pointerIdRef.current !== event.pointerId) return;

      const startPoint = startPointRef.current;
      if (!startPoint) return;

      const deltaX = event.clientX - startPoint.x;
      const deltaY = event.clientY - startPoint.y;

      if (phaseRef.current === 'vertical') {
        const verticalDistance = deltaY;
        const horizontalDrift = Math.abs(deltaX);

        const validVerticalStroke =
          verticalDistance >= minimumStrokeDistance &&
          verticalDistance >= horizontalDrift * 1.35;

        if (validVerticalStroke) {
          phaseRef.current = 'horizontal';
          verticalEndPointRef.current = {
            x: event.clientX,
            y: event.clientY,
          };
        }

        return;
      }

      if (phaseRef.current === 'horizontal') {
        const verticalEndPoint = verticalEndPointRef.current;
        if (!verticalEndPoint) return;

        const horizontalDistance = event.clientX - verticalEndPoint.x;
        const verticalDrift = Math.abs(event.clientY - verticalEndPoint.y);

        const validHorizontalStroke =
          horizontalDistance >= minimumStrokeDistance &&
          horizontalDistance >= verticalDrift * 1.35;

        if (validHorizontalStroke) {
          completeGesture();
        }
      }
    },
    [completeGesture, enabled, minimumStrokeDistance]
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerIdRef.current !== event.pointerId) return;

      event.currentTarget.releasePointerCapture?.(event.pointerId);

      if (phaseRef.current !== 'idle' && !isCompletingRef.current) {
        reset();
      }
    },
    [reset]
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerIdRef.current !== event.pointerId) return;

      event.currentTarget.releasePointerCapture?.(event.pointerId);
      reset();
    },
    [reset]
  );

  useEffect(() => {
    if (!enabled) {
      reset();
    }
  }, [enabled, reset]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return {
    enabled,
    reset,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}