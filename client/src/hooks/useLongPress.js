import { useRef } from "react";

export default function useLongPress(onLongPress, onClick, delay = 600) {
  const timerRef = useRef(null);
  const triggeredRef = useRef(false);

  const start = (e) => {
    if (e?.preventDefault) e.preventDefault();

    triggeredRef.current = false;
    timerRef.current = window.setTimeout(() => {
      triggeredRef.current = true;
      if (onLongPress) onLongPress(e);
    }, delay);
  };

  const clear = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!triggeredRef.current && onClick) {
      onClick(e);
    }
  };

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e) => e.preventDefault(),
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: clear,
  };
}