import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Pill, Mail, Lock, User, ArrowRight, LogOut } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { useLanguage, type Language } from "../hooks/useLanguage";
import { auth, db, isFirebaseEnabled } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Medily" },
      {
        name: "description",
        content: "Sign in or create your Medily account to save pharmacies and track medicines.",
      },
      { property: "og:title", content: "Sign in — Medily" },
      { property: "og:description", content: "Access your Medily account." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
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

  const signOut = async () => {
    if (isFirebaseEnabled() && auth) {
      try {
        await auth.signOut();
      } catch (err) {
        console.error("Firebase signout error:", err);
      }
    }
    localStorage.removeItem("medily_user");
    setCurrentUser(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || (mode === "signup" && !name)) {
      setError(t("auth.fillfields"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.passlength"));
      return;
    }
    setLoading(true);

    if (!isFirebaseEnabled() || !auth) {
      setError(
        "Firebase is not configured. Please configure your Firebase configuration via the database settings button at the top of the page first.",
      );
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        // Save user details in Firestore "users" collection
        if (db) {
          try {
            await setDoc(doc(db, "users", userCredential.user.uid), {
              uid: userCredential.user.uid,
              name,
              email,
              createdAt: new Date().toISOString(),
            });
          } catch (fsError) {
            console.warn(
              "Firestore user profile creation skipped due to permissions. User registration will continue using Auth/local storage:",
              fsError,
            );
          }
        }

        localStorage.setItem("medily_user", JSON.stringify({ name: name, email }));
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem(
          "medily_user",
          JSON.stringify({ name: userCredential.user.displayName || email.split("@")[0], email }),
        );
      }
      setLoading(false);
      navigate({ to: "/" });
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Authentication failed.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already in use.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (
        err.code === "auth/configuration-not-found" ||
        err.code === "auth/operation-not-allowed"
      ) {
        msg =
          "Email/Password authentication is not enabled in your Firebase Console. Go to Authentication > Sign-in method and enable Email/Password.";
      } else if (err.code === "permission-denied" || err.message?.includes("permission")) {
        msg =
          "Firestore write permission denied. Make sure your Firestore Security Rules allow writes to the 'users' collection.";
      }
      setError(msg);
      setLoading(false);
    }
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
          {t("nav.backHome")}
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
                {t("auth.signedin")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentUser.name} · {currentUser.email}
              </p>
              <button
                onClick={signOut}
                className="mt-6 inline-flex items-center gap-2 px-6 h-11 rounded-full text-destructive bg-destructive/10 font-semibold hover:bg-destructive/20 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                {t("auth.signout")}
              </button>
              <div className="mt-4">
                <Link to="/" className="text-sm text-primary font-medium hover:underline">
                  {t("auth.gohome")}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="font-display text-3xl font-semibold tracking-tight">
                  {mode === "signin" ? t("auth.welcome") : t("auth.createAccount")}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mode === "signin" ? t("auth.signinSubtitle") : t("auth.signupSubtitle")}
                </p>
              </div>

              <div className="grid grid-cols-2 p-1 rounded-full bg-secondary text-sm mb-6">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`h-9 rounded-full font-medium transition cursor-pointer ${
                    mode === "signin"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("auth.signin")}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`h-9 rounded-full font-medium transition cursor-pointer ${
                    mode === "signup"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("auth.signup")}
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                {mode === "signup" && (
                  <Field
                    icon={<User className="h-4 w-4" />}
                    type="text"
                    placeholder={t("auth.fullname")}
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
                  placeholder={t("auth.password")}
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
                  className="w-full h-11 rounded-full text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-95 transition cursor-pointer"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  {loading
                    ? t("auth.wait")
                    : mode === "signin"
                      ? t("auth.signin")
                      : t("auth.createAccountBtn")}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? t("auth.new") : t("auth.already")}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  {mode === "signin" ? t("auth.createBtn") : t("auth.signin")}
                </button>
              </p>
            </>
          )}

          {/* Language Selection Dropdown */}
          <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("auth.selectLang")}
            </label>
            <div className="relative inline-block w-44">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full bg-secondary border border-border rounded-full h-9 px-4 pr-8 text-xs font-semibold text-foreground outline-none focus:border-primary/40 appearance-none cursor-pointer"
                style={{
                  backgroundImage:
                    "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px top 50%",
                  backgroundSize: "8px auto",
                }}
              >
                <option value="en">English (US)</option>
                <option value="es">Español (ES)</option>
                <option value="hi">हिन्दी (IN)</option>
                <option value="fr">Français (FR)</option>
              </select>
            </div>
          </div>
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
