export type LGestureOptions = {
  enabled?: boolean;
  onGestureDetected?: () => void;
  onLGesture?: () => void;
  [key: string]: unknown;
};

type InertLGestureApi = {
  onPointerDown: () => void;
  onPointerMove: () => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  reset: () => void;
};

const noop = (): void => {};

const inertLGestureApi: InertLGestureApi = Object.freeze({
  onPointerDown: noop,
  onPointerMove: noop,
  onPointerUp: noop,
  onPointerCancel: noop,
  reset: noop,
});

export default function useLGesture(
  _options: LGestureOptions = {}
): InertLGestureApi {
  return inertLGestureApi;
}