import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type SelectContextType = {
  value: string | undefined;
  onValueChange: (v: string) => void;
  registerItem: (item: { value: string; label: React.ReactNode }) => void;
  items: { value: string; label: React.ReactNode }[];
  open: boolean;
  setOpen: (o: boolean) => void;
};

const SelectContext = createContext<SelectContextType | null>(null);

type SelectProps = {
  value?: string;
  onValueChange?: (v: string) => void;
  children?: React.ReactNode;
  className?: string;
};

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children, className }) => {
  const [items, setItems] = useState<{ value: string; label: React.ReactNode }[]>([]);
  const [open, setOpen] = useState(false);

  // registration function for items
  const registerItem = (item: { value: string; label: React.ReactNode }) => {
    setItems((prev) => {
      // avoid duplicates by value
      if (prev.some((p) => p.value === item.value)) return prev;
      return [...prev, item];
    });
  };

  // ensure items stable order: keep insertion order (done by pushing)
  const ctx = useMemo(
    () => ({
      value,
      onValueChange: onValueChange || (() => {}),
      registerItem,
      items,
      open,
      setOpen,
    }),
    [value, onValueChange, items, open]
  );

  // close on outside click
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <SelectContext.Provider value={ctx}>
      <div ref={rootRef} className={className || "relative inline-block"}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

type TriggerProps = {
  children?: React.ReactNode;
  className?: string;
};
export const SelectTrigger: React.FC<TriggerProps> = ({ children, className }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={className || "w-full text-left border rounded px-3 py-2 flex items-center justify-between"}
    >
      {children}
      {/* small caret */}
      <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

type ValueProps = {
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
};
export const SelectValue: React.FC<ValueProps> = ({ placeholder, children, className }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;

  // If children provided, render them (used rarely). Otherwise render selected label or placeholder.
  if (children) return <span className={className}>{children}</span>;

  const selected = ctx.items.find((i) => i.value === ctx.value);
  return (
    <span className={className || "truncate"}>
      {selected ? selected.label : <span className="text-muted-foreground">{placeholder ?? "Select..."}</span>}
    </span>
  );
};

type ContentProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};
export const SelectContent: React.FC<ContentProps> = ({ children, className, style }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;

  // Render items from ctx.items if children not provided.
  if (!ctx.open) return null;

  return (
    <div
      className={className || "absolute z-20 mt-1 w-full bg-white border rounded shadow-md"}
      style={style}
      role="listbox"
    >
      {/* If user provided children (SelectItem components), render them; otherwise render items */}
      {children ? children : ctx.items.map((it) => <ContentItem key={it.value} value={it.value}>{it.label}</ContentItem>)}
    </div>
  );
};

// Internal helper used when SelectContent renders fallback items
const ContentItem: React.FC<{ value: string; children?: React.ReactNode }> = ({ value, children }) => {
  const ctx = useContext(SelectContext)!;
  return (
    <div
      role="option"
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
    >
      {children}
    </div>
  );
};

type ItemProps = {
  value: string;
  children?: React.ReactNode;
  className?: string;
};
export const SelectItem: React.FC<ItemProps> = ({ value, children, className }) => {
  const ctx = useContext(SelectContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.registerItem({ value, label: children ?? value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, String(children)]); // re-register if value or children string changes

  if (!ctx) return null;

  return (
    <div
      role="option"
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
      className={className || "px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"}
    >
      {children}
    </div>
  );
};

// default export (optional)
export default Select;
