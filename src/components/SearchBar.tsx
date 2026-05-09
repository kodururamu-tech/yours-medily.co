import { Search, X } from "lucide-react";
import { useState, type FormEvent } from "react";

type Props = {
  initial?: string;
  onSearch: (q: string) => void;
  size?: "lg" | "md";
};

export function SearchBar({ initial = "", onSearch, size = "lg" }: Props) {
  const [value, setValue] = useState(initial);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  const isLg = size === "lg";

  return (
    <form
      onSubmit={submit}
      className={`group relative flex items-center w-full rounded-full bg-card border border-border shadow-[var(--shadow-card)] transition-all focus-within:shadow-[var(--shadow-glow)] focus-within:border-primary/40 ${
        isLg ? "h-16 pl-6 pr-2" : "h-12 pl-4 pr-1"
      }`}
    >
      <Search className={`text-muted-foreground shrink-0 ${isLg ? "h-5 w-5" : "h-4 w-4"}`} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search any medicine, e.g. Paracetamol"
        className={`flex-1 bg-transparent outline-none px-4 placeholder:text-muted-foreground/70 ${
          isLg ? "text-lg" : "text-sm"
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="p-2 text-muted-foreground hover:text-foreground"
          aria-label="Clear"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button
        type="submit"
        className={`shrink-0 rounded-full bg-primary text-primary-foreground font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] ${
          isLg ? "h-12 px-6 text-base" : "h-10 px-5 text-sm"
        }`}
        style={{ background: "var(--gradient-hero)" }}
      >
        Search
      </button>
    </form>
  );
}
