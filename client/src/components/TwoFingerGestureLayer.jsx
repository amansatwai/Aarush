import useTwoFingerSwipe from '../hooks/useTwoFingerSwipe';

export default function TwoFingerGestureLayer({
  enabled = true,
  onSwipe,
}) {
  useTwoFingerSwipe({
    enabled,
    onSwipe,
  });

  return null;
}