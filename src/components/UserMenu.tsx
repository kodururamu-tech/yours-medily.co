import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { User, LogOut, LogIn } from "lucide-react";

interface UserData {
  name: string;
  email: string;
}

export function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("medily_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const signOut = () => {
    localStorage.removeItem("medily_user");
    setUser(null);
    setOpen(false);
    navigate({ to: "/" });
  };

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/signin"
          className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition"
        >
          Sign in
        </Link>
        <Link
          to="/signin"
          className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-card border border-border hover:border-primary/40 transition"
      >
        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-[var(--shadow-card)] p-2 z-50">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
