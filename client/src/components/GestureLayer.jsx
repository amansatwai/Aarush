/**
 * Compatibility placeholder for the retired L-gesture system.
 *
 * This component intentionally:
 * - Registers no browser event listeners.
 * - Performs no gesture detection.
 * - Does not navigate.
 * - Does not prevent or modify user interaction.
 * - Renders no UI.
 *
 * It remains available temporarily so any stale imports do not break
 * the application while the old feature is fully removed.
 */
export default function GestureLayer() {
  return null;
}