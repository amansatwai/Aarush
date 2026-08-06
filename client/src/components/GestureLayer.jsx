import { useEffect } from 'react';
import useLGesture from '../hooks/useLGesture';

export default function GestureLayer({ enabled = true, onLGesture }) {
  const gestureHandlers = useLGesture({
    enabled,
    onGestureDetected: onLGesture,
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const handlePointerDown = (event) => {
      gestureHandlers.onPointerDown(event);
    };

    const handlePointerMove = (event) => {
      gestureHandlers.onPointerMove(event);
    };

    const handlePointerUp = (event) => {
      gestureHandlers.onPointerUp(event);
    };

    const handlePointerCancel = (event) => {
      gestureHandlers.onPointerCancel(event);
    };

    window.addEventListener('pointerdown', handlePointerDown, {
      passive: true,
      capture: true,
    });

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
      capture: true,
    });

    window.addEventListener('pointerup', handlePointerUp, {
      passive: true,
      capture: true,
    });

    window.addEventListener('pointercancel', handlePointerCancel, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerCancel, true);

      gestureHandlers.reset();
    };
  }, [enabled, gestureHandlers]);

  return null;
}