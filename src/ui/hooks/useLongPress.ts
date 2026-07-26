import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const LONG_PRESS_MS = 450;
const MOVE_CANCEL_THRESHOLD_PX = 10;

export interface LongPressHandlers {
  readonly onPointerDown: (event: ReactPointerEvent) => void;
  readonly onPointerMove: (event: ReactPointerEvent) => void;
  readonly onPointerUp: () => void;
  readonly onPointerLeave: () => void;
}

/** Appui long générique (pointerdown + timer + seuil de mouvement pour annuler) — sert aux infobulles de statut. */
export function useLongPress(onLongPress: () => void, onCancel?: () => void): LongPressHandlers {
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      startRef.current = { x: event.clientX, y: event.clientY };
      timerRef.current = window.setTimeout(onLongPress, LONG_PRESS_MS);
    },
    [onLongPress],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const start = startRef.current;
      if (!start) {
        return;
      }
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.hypot(dx, dy) > MOVE_CANCEL_THRESHOLD_PX) {
        clear();
        onCancel?.();
      }
    },
    [clear, onCancel],
  );

  const onPointerUp = useCallback(() => {
    clear();
  }, [clear]);

  const onPointerLeave = useCallback(() => {
    clear();
    onCancel?.();
  }, [clear, onCancel]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave };
}
