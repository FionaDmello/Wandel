import { useEffect, useRef } from "react";

interface OverlayModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function OverlayModal({ onClose, children }: OverlayModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || e.isComposing) return;
      onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-[400] bg-plum/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[401] flex items-center justify-center px-6 pointer-events-none">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="relative bg-canvas rounded-3xl w-full max-h-[80dvh] overflow-y-auto pointer-events-auto"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 font-sans text-[16px] text-muted leading-none"
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    </>
  );
}
