import { useCallback, useEffect, useRef } from 'react';

type SwipeDirection = 'up' | 'down';

type TwoFingerSwipeOptions = {
  enabled?: boolean;
  threshold?: number;
  onSwipe?: (direction: SwipeDirection) => void;
};

type TouchStartPoint = {
  x: number;
  y: number;
};

export default function useTwoFingerSwipe({
  enabled = true,
  threshold = 110,
  onSwipe,
}: TwoFingerSwipeOptions = {}) {
  const touchStartRef = useRef<TouchStartPoint | null>(null);
  const touchActiveRef = useRef(false);
  const gestureTriggeredRef = useRef(false);
  const wheelDistanceRef = useRef(0);
  const wheelTimerRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    touchStartRef.current = null;
    touchActiveRef.current = false;
    gestureTriggeredRef.current = false;
    wheelDistanceRef.current = 0;

    if (wheelTimerRef.current !== null) {
      window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = null;
    }
  }, []);

  const triggerSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (gestureTriggeredRef.current) {
        return;
      }

      gestureTriggeredRef.current = true;
      onSwipe?.(direction);
    },
    [onSwipe]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!enabled || event.ctrlKey || event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
        return;
      }

      const deltaX = Math.abs(event.deltaX);
      const deltaY = Math.abs(event.deltaY);

      if (deltaY < 1 || deltaX > deltaY * 0.8) {
        return;
      }

      const isTrackpadLike =
        !Number.isInteger(event.deltaY) || deltaY < 50;

      if (!isTrackpadLike) {
        return;
      }

      wheelDistanceRef.current += event.deltaY;

      if (Math.abs(wheelDistanceRef.current) >= threshold) {
        triggerSwipe(wheelDistanceRef.current < 0 ? 'up' : 'down');
        wheelDistanceRef.current = 0;
      }

      if (wheelTimerRef.current !== null) {
        window.clearTimeout(wheelTimerRef.current);
      }

      wheelTimerRef.current = window.setTimeout(() => {
        wheelDistanceRef.current = 0;
        wheelTimerRef.current = null;
      }, 180);
    },
    [enabled, threshold, triggerSwipe]
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!enabled || event.touches.length !== 2) {
        reset();
        return;
      }

      const firstTouch = event.touches[0];
      const secondTouch = event.touches[1];

      touchStartRef.current = {
        x: (firstTouch.clientX + secondTouch.clientX) / 2,
        y: (firstTouch.clientY + secondTouch.clientY) / 2,
      };

      touchActiveRef.current = true;
      gestureTriggeredRef.current = false;
    },
    [enabled, reset]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (
        !enabled ||
        !touchActiveRef.current ||
        !touchStartRef.current ||
        event.touches.length !== 2 ||
        gestureTriggeredRef.current
      ) {
        return;
      }

      const firstTouch = event.touches[0];
      const secondTouch = event.touches[1];

      const currentX = (firstTouch.clientX + secondTouch.clientX) / 2;
      const currentY = (firstTouch.clientY + secondTouch.clientY) / 2;

      const deltaX = currentX - touchStartRef.current.x;
      const deltaY = currentY - touchStartRef.current.y;

      if (Math.abs(deltaX) > Math.abs(deltaY) * 0.8) {
        return;
      }

      if (Math.abs(deltaY) >= threshold) {
        triggerSwipe(deltaY < 0 ? 'up' : 'down');
      }
    },
    [enabled, threshold, triggerSwipe]
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length !== 0) {
        if (event.touches.length !== 2) {
          reset();
        }

        return;
      }

      reset();
    },
    [reset]
  );

  useEffect(() => {
    if (!enabled) {
      reset();
      return undefined;
    }

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      reset();
    };
  }, [
    enabled,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    handleWheel,
    reset,
  ]);

  return { reset };
}