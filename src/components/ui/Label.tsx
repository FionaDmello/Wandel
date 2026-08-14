interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  id?: string;
}

export function Label({ children, htmlFor, id }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      id={id}
      className="block font-sans font-medium text-[9px] text-amber tracking-[0.09em] uppercase mb-2"
    >
      {children}
    </label>
  );
}
