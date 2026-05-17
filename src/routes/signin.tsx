import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Pill, Mail, Lock, User, ArrowRight, LogOut } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Medily" },
      { name: "description", content: "Sign in or create your Medily account to save pharmacies and track medicines." },
      { property: "og:title", content: "Sign in — Medily" },
      { property: "og:description", content: "Access your Medily account." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("medily_user");
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const signOut = () => {
    localStorage.removeItem("medily_user");
    setCurrentUser(null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    // Demo only — no backend yet
    setTimeout(() => {
      try {
        localStorage.setItem(
          "medily_user",
          JSON.stringify({ name: name || email.split("@")[0], email }),
        );
      } catch {
        // ignore
      }
      setLoading(false);
      navigate({ to: "/" });
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-soft)" }}>
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Pill className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Medily</span>
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">
          ← Back to home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-card)]"
        >
          {currentUser ? (
            <div className="text-center py-4">
              <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <User className="h-7 w-7" />
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                You're signed in
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentUser.name} · {currentUser.email}
              </p>
              <button
                onClick={signOut}
                className="mt-6 inline-flex items-center gap-2 px-6 h-11 rounded-full text-destructive bg-destructive/10 font-semibold hover:bg-destructive/20 transition"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
              <div className="mt-4">
                <Link
                  to="/"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Go to home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="font-display text-3xl font-semibold tracking-tight">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mode === "signin"
                    ? "Sign in to save pharmacies and track medicines."
                    : "Join Medily to find medicines near you, faster."}
                </p>
              </div>

          <div className="grid grid-cols-2 p-1 rounded-full bg-secondary text-sm mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`h-9 rounded-full font-medium transition ${
                mode === "signin" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`h-9 rounded-full font-medium transition ${
                mode === "signup" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field
                icon={<User className="h-4 w-4" />}
                type="text"
                placeholder="Full name"
                value={name}
                onChange={setName}
                autoComplete="name"
              />
            )}
            <Field
              icon={<Mail className="h-4 w-4" />}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-95 transition"
              style={{ background: "var(--gradient-hero)" }}
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Medily? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </>
      )}
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="flex items-center gap-3 h-11 px-4 rounded-full bg-secondary/60 border border-border focus-within:border-primary/50 focus-within:bg-card transition">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
    </label>
  );
}
