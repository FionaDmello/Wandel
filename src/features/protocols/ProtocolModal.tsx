import { useCallback, useEffect, useRef, useState } from "react";

interface ProtocolModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
}

export function ProtocolModal({
  children,
  onClose,
  dismissible = true,
}: ProtocolModalProps) {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const hasClosedRef = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragDelta = useRef(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const finishDismiss = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    setClosed(true);
    onClose?.();
  }, [onClose]);

  const dismiss = useCallback(() => {
    if (!dismissible) return;
    setVisible(false);
    setTimeout(finishDismiss, 380);
  }, [dismissible, finishDismiss]);

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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[301] bg-canvas rounded-t-[22px] max-h-[90dvh] overflow-y-auto transition-protocol-sheet ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {children}
      </div>
    </>
  );
}
