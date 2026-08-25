interface ScreenWrapProps {
  children: React.ReactNode;
  padBottom?: boolean;
}

export function ScreenWrap({ children, padBottom = true }: ScreenWrapProps) {
  return (
    <div
      className={`relative overflow-hidden min-h-dvh bg-screen ${padBottom ? "pb-tabbar" : "pb-0"}`}
    >
      {children}
    </div>
  );
}
