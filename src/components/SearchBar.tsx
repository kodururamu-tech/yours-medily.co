import { Search, X, Mic, Camera } from "lucide-react";
import { useState, type FormEvent } from "react";
import { VoiceSearch } from "./VoiceSearch";
import { ImageSearch } from "./ImageSearch";
import { useLanguage } from "../hooks/useLanguage";

type Props = {
  initial?: string;
  onSearch: (q: string) => void;
  size?: "lg" | "md";
};

export function SearchBar({ initial = "", onSearch, size = "lg" }: Props) {
  const [value, setValue] = useState(initial);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { t } = useLanguage();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  const isLg = size === "lg";

  const handleVoiceResult = (result: string) => {
    setValue(result);
    onSearch(result);
  };

  const handleImageResult = (result: string) => {
    setValue(result);
    onSearch(result);
  };

  return (
    <>
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
          placeholder={t("hero.placeholder")}
          className={`flex-1 bg-transparent outline-none px-4 placeholder:text-muted-foreground/70 ${
            isLg ? "text-lg" : "text-sm"
          }`}
        />

        {/* Search Assistant Tools */}
        <div className="flex items-center gap-0.5 shrink-0 mr-1.5">
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/40 transition-colors cursor-pointer"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Voice Search Mic Button */}
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full transition-colors cursor-pointer"
            title={t("voice.title")}
          >
            <Mic className={isLg ? "h-5 w-5" : "h-4 w-4"} />
          </button>

          {/* Camera/Photo Scanner Button */}
          <button
            type="button"
            onClick={() => setIsImageOpen(true)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-full transition-colors cursor-pointer"
            title={t("image.title")}
          >
            <Camera className={isLg ? "h-5 w-5" : "h-4 w-4"} />
          </button>
        </div>

        <button
          type="submit"
          className={`shrink-0 rounded-full bg-primary text-primary-foreground font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            isLg ? "h-12 px-6 text-base" : "h-10 px-5 text-sm"
          }`}
          style={{ background: "var(--gradient-hero)" }}
        >
          {t("hero.searchBtn")}
        </button>
      </form>

      {/* Voice Assistant Modal */}
      <VoiceSearch
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onResult={handleVoiceResult}
      />

      {/* Image Photo Scanner Modal */}
      <ImageSearch
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        onSearch={handleImageResult}
      />
    </>
  );
}
