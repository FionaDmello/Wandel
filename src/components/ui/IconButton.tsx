interface IconButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function IconButton({
  children,
  onClick,
  ariaLabel,
  disabled,
  className = "",
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`p-2 bg-transparent border-none ${disabled ? "cursor-default" : "cursor-pointer"} ${className}`}
    >
      {children}
    </button>
  );
}
