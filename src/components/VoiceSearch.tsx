import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onResult: (transcript: string) => void;
};

export function VoiceSearch({ isOpen, onClose, onResult }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const submitTimeoutRef = useRef<any>(null);

  const updateTranscript = (val: string) => {
    setTranscript(val);
    transcriptRef.current = val;
  };

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      return;
    }

    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Speech Recognition is not supported in this browser. Please try Chrome, Edge, or Safari.",
      );
      onClose();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        updateTranscript("");
        setInterimTranscript("");
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          const currentText = transcriptRef.current;
          const newTranscript = (currentText + " " + final).trim();
          updateTranscript(newTranscript);

          // Clear any existing timeout to avoid multiple submissions
          if (submitTimeoutRef.current) {
            clearTimeout(submitTimeoutRef.current);
          }

          // Debounce submit so if the user pauses for 1.2s, auto-trigger the search
          submitTimeoutRef.current = setTimeout(() => {
            const finalQuery = transcriptRef.current.trim();
            if (finalQuery) {
              onResult(finalQuery);
              toast.success(`Searching for: "${finalQuery}"`);
              onClose();
            }
          }, 1200);
        }
        setInterimTranscript(interim);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        if (event.error === "not-allowed") {
          toast.error(
            "Microphone access blocked. Please allow microphone permission in your browser settings.",
          );
        } else {
          toast.error(`Voice Search Error: ${event.error}`);
        }
        onClose();
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.error(e);
      toast.error("Failed to start voice search.");
      onClose();
    }
  };

  const stopListening = () => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-glow)] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Voice Assistant
          </DialogTitle>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          {/* Micro Pulsing Visuals */}
          <div className="relative flex items-center justify-center w-32 h-32 mb-8">
            <AnimatePresence>
              {isListening && (
                <>
                  <motion.div
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{
                      opacity: [0.1, 0.4, 0.1],
                      scale: [1, 2.2, 1],
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    className="absolute w-24 h-24 rounded-full bg-primary/20"
                  />
                  <motion.div
                    initial={{ opacity: 0.6, scale: 0.8 }}
                    animate={{
                      opacity: [0.2, 0.6, 0.2],
                      scale: [1, 1.6, 1],
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: 0.3,
                      ease: "easeInOut",
                    }}
                    className="absolute w-24 h-24 rounded-full bg-primary/30"
                  />
                </>
              )}
            </AnimatePresence>

            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full text-primary-foreground shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                isListening ? "bg-destructive" : "bg-primary"
              }`}
              style={{
                background: isListening ? undefined : "var(--gradient-hero)",
              }}
            >
              {isListening ? (
                <Mic className="h-9 w-9 animate-pulse" />
              ) : (
                <MicOff className="h-9 w-9" />
              )}
            </button>
          </div>

          <div className="min-h-[80px] w-full flex flex-col justify-center items-center">
            {isListening ? (
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium text-primary animate-pulse tracking-wide">
                  LISTENING...
                </p>
                <div className="max-w-xs mx-auto text-base text-foreground font-medium leading-relaxed break-words line-clamp-3">
                  {transcript || interimTranscript ? (
                    <span>
                      {transcript}
                      <span className="text-muted-foreground/60"> {interimTranscript}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">
                      "Say medicine name, e.g. Paracetamol"
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {transcript ? (
                  <div className="max-w-xs mx-auto text-base text-foreground font-medium leading-relaxed break-words line-clamp-3 mb-2">
                    "{transcript}"
                  </div>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">Voice search stopped</p>
                )}
                <button
                  onClick={startListening}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {transcript ? "Speak again" : "Tap to speak again"}
                </button>
              </div>
            )}

            {transcript && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  const finalQuery = transcript.trim();
                  if (finalQuery) {
                    onResult(finalQuery);
                    toast.success(`Searching for: "${finalQuery}"`);
                    onClose();
                  }
                }}
                className="mt-6 inline-flex items-center gap-2 px-6 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer"
                style={{ background: "var(--gradient-hero)" }}
              >
                Search for "{transcript.trim()}"
              </motion.button>
            )}
          </div>
        </div>

        {/* Audio Waveform decorative effect */}
        {isListening && (
          <div className="flex justify-center items-center gap-1.5 h-6 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
              <motion.div
                key={bar}
                className="w-1 bg-primary rounded-full"
                animate={{
                  height: [8, Math.random() * 24 + 8, 8],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
