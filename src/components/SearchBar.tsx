import { Search, X, Mic, Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

type Props = {
  initial?: string;
  onSearch: (q: string) => void;
  size?: "lg" | "md";
};

// Minimal type for Web Speech API
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function SearchBar({ initial = "", onSearch, size = "lg" }: Props) {
  const [value, setValue] = useState(initial);
  const [listening, setListening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLg = size === "lg";

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  const startVoice = () => {
    setError(null);
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;
    if (!SR) {
      setError("Voice search isn't supported in this browser. Try Chrome.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      const cleaned = transcript.trim().replace(/[.,!?]$/, "");
      if (cleaned) {
        setValue(cleaned);
        onSearch(cleaned);
      }
    };
    recognition.onerror = () => setError("Couldn't hear you — please try again.");
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  };

  const onPickPhoto = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/identify-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      const data = (await res.json()) as { name?: string; error?: string };
      if (!res.ok || !data.name) {
        setError(data.error || "Couldn't identify the medicine. Try a clearer photo.");
        return;
      }
      setValue(data.name);
      onSearch(data.name);
    } catch (err) {
      setError((err as Error).message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
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
          className={`flex-1 bg-transparent outline-none px-4 placeholder:text-muted-foreground/70 min-w-0 ${
            isLg ? "text-lg" : "text-sm"
          }`}
        />
        {value && !uploading && !listening && (
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
          type="button"
          onClick={startVoice}
          aria-label={listening ? "Stop listening" : "Voice search"}
          title="Voice search"
          className={`shrink-0 ${isLg ? "h-11 w-11" : "h-9 w-9"} rounded-full flex items-center justify-center mr-1 transition ${
            listening
              ? "bg-destructive/15 text-destructive animate-pulse"
              : "bg-secondary text-foreground hover:bg-secondary/70"
          }`}
        >
          <Mic className={isLg ? "h-5 w-5" : "h-4 w-4"} />
        </button>

        <button
          type="button"
          onClick={onPickPhoto}
          disabled={uploading}
          aria-label="Search by photo"
          title="Search by photo"
          className={`shrink-0 ${isLg ? "h-11 w-11" : "h-9 w-9"} rounded-full flex items-center justify-center mr-1 bg-secondary text-foreground hover:bg-secondary/70 transition disabled:opacity-60`}
        >
          {uploading ? (
            <Loader2 className={`${isLg ? "h-5 w-5" : "h-4 w-4"} animate-spin`} />
          ) : (
            <Camera className={isLg ? "h-5 w-5" : "h-4 w-4"} />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPhotoChange}
          className="hidden"
        />

        <button
          type="submit"
          className={`shrink-0 rounded-full text-primary-foreground font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] ${
            isLg ? "h-12 px-6 text-base" : "h-10 px-5 text-sm"
          }`}
          style={{ background: "var(--gradient-hero)" }}
        >
          Search
        </button>
      </form>

      {(listening || uploading || error) && (
        <div className="mt-2 px-2 text-xs">
          {listening && (
            <span className="text-destructive font-medium">● Listening… say a medicine name</span>
          )}
          {uploading && !listening && (
            <span className="text-muted-foreground">Identifying medicine from photo…</span>
          )}
          {error && !listening && !uploading && <span className="text-destructive">{error}</span>}
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
