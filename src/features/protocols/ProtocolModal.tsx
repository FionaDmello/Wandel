import { useCallback, useEffect, useRef, useState } from "react";

import { trapFocus } from "@/lib/trapFocus";

interface ProtocolModalProps {
  children: React.ReactNode;
  title: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export function ProtocolModal({
  children,
  title,
  onClose,
  dismissible = true,
}: ProtocolModalProps) {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [closed, setClosed] = useState(false);
  const hasClosedRef = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragDelta = useRef(0);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, []);

  const finishDismiss = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    setClosed(true);
    onClose?.();
  }, [onClose]);

  const dismiss = useCallback(() => {
    if (!dismissible || dismissing) return;
    setVisible(false);
    setDismissing(true);
    setTimeout(finishDismiss, 380);
  }, [dismissible, dismissing, finishDismiss]);

  // Local keydown handlers elsewhere in the app (e.g. JobsConfig's inline
  // "add job" input) don't stopPropagation on Escape, so a future component
  // nested inside a ProtocolModal that adds its own Escape handling would
  // trigger both this dismiss and its own — worth checking for if that
  // ever becomes a real consumer.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.isComposing) {
        dismiss();
        return;
      }
      if (e.key === "Tab") {
        trapFocus(e, sheetRef.current);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dismiss]);

  function handleTouchStart(e: React.TouchEvent) {
    if (sheetRef.current) sheetRef.current.style.transition = "none";
    dragStartY.current = e.touches[0].clientY;
    dragDelta.current = 0;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (dragStartY.current === null || !sheetRef.current) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta <= 0) return;
    dragDelta.current = delta;
    sheetRef.current.style.transform = `translateX(-50%) translateY(${delta}px)`;
  }

  function handleTouchEnd() {
    if (!sheetRef.current) return;
    const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
    if (dismissible && dragDelta.current > 80) {
      sheetRef.current.style.transition = `transform 380ms ${easing}`;
      sheetRef.current.style.transform = "translateX(-50%) translateY(100%)";
      setDismissing(true);
      setTimeout(finishDismiss, 380);
    } else {
      sheetRef.current.style.transition = `transform 320ms ${easing}`;
      sheetRef.current.style.transform = "";
    }
    dragStartY.current = null;
    dragDelta.current = 0;
  }

  if (closed) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[300] bg-plum/35"
        aria-hidden="true"
        onClick={dismiss}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[301] bg-canvas rounded-t-[22px] max-h-[90dvh] overflow-y-auto transition-protocol-sheet ${
          visible ? "translate-y-0" : "translate-y-full"
        } ${dismissing ? "pointer-events-none" : ""}`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {children}
      </div>
    </>
  );
}
