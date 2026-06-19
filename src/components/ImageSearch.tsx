import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  X,
  Pill,
  CheckCircle,
  FileText,
  AlertCircle,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (q: string) => void;
};

type ScanStep = "idle" | "capturing" | "uploading" | "analyzing" | "completed";

type MedicineMatch = {
  name: string;
  confidence: number;
  activeIngredients: string;
  category: string;
  description: string;
};

// Database of mock medicines for realistic classification matches
const MEDICINE_DATABASE: Record<string, MedicineMatch> = {
  paracetamol: {
    name: "Paracetamol",
    confidence: 98,
    activeIngredients: "Paracetamol 500mg",
    category: "Analgesic & Antipyretic",
    description: "Used for relieving mild to moderate pain and reducing fever.",
  },
  ibuprofen: {
    name: "Ibuprofen",
    confidence: 96,
    activeIngredients: "Ibuprofen 400mg",
    category: "Nonsteroidal Anti-inflammatory Drug (NSAID)",
    description: "Used for reducing inflammation, relieving pain, and lowering fever.",
  },
  amoxicillin: {
    name: "Amoxicillin",
    confidence: 95,
    activeIngredients: "Amoxicillin 250mg / 500mg",
    category: "Penicillin Antibiotic",
    description: "Used to treat a wide variety of bacterial infections.",
  },
  cetirizine: {
    name: "Cetirizine",
    confidence: 97,
    activeIngredients: "Cetirizine Hydrochloride 10mg",
    category: "Antihistamine",
    description: "Used for relieving allergy symptoms like watery eyes, runny nose, and sneezing.",
  },
  azithromycin: {
    name: "Azithromycin",
    confidence: 94,
    activeIngredients: "Azithromycin 500mg",
    category: "Macrolide Antibiotic",
    description:
      "Used to treat various bacterial infections of the respiratory tract, skin, and ears.",
  },
  metformin: {
    name: "Metformin",
    confidence: 97,
    activeIngredients: "Metformin Hydrochloride 500mg / 850mg",
    category: "Antidiabetic agent",
    description: "Used to control blood sugar levels in people with type 2 diabetes.",
  },
  pantoprazole: {
    name: "Pantoprazole",
    confidence: 95,
    activeIngredients: "Pantoprazole Sodium 40mg",
    category: "Proton Pump Inhibitor (PPI)",
    description: "Used to treat gastroesophageal reflux disease (GERD) and excess stomach acid.",
  },
  aspirin: {
    name: "Aspirin",
    confidence: 98,
    activeIngredients: "Acetylsalicylic Acid 75mg / 150mg / 325mg",
    category: "Antiplatelet / Analgesic",
    description: "Used to reduce pain, fever, or inflammation and prevent cardiovascular events.",
  },
};

export function ImageSearch({ isOpen, onClose, onSearch }: Props) {
  const [step, setStep] = useState<ScanStep>("idle");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState("");
  const [matchedMedicine, setMatchedMedicine] = useState<MedicineMatch | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      resetScanner();
    }
  }, [isOpen]);

  const resetScanner = () => {
    stopCamera();
    setImageSrc(null);
    setStep("idle");
    setScanProgress(0);
    setScanStatusText("");
    setMatchedMedicine(null);
    setUseWebcam(false);
  };

  const startCamera = async () => {
    try {
      setUseWebcam(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed", err);
      toast.error("Could not access camera. Please upload an image instead.");
      setUseWebcam(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImageSrc(dataUrl);
        stopCamera();
        setUseWebcam(false);
        runScanAnalysis("captured_camera_image.jpg");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        runScanAnalysis(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const runScanAnalysis = (fileName: string) => {
    setStep("analyzing");
    setScanProgress(0);

    const lowercaseName = fileName.toLowerCase();
    let detectedKey = "";

    // Match keywords from the filename
    for (const key of Object.keys(MEDICINE_DATABASE)) {
      if (lowercaseName.includes(key)) {
        detectedKey = key;
        break;
      }
    }

    // Default match if nothing found
    if (!detectedKey) {
      // Pick a random medicine from the list for simulated match
      const keys = Object.keys(MEDICINE_DATABASE);
      detectedKey = keys[Math.floor(Math.random() * keys.length)];
    }

    const matchInfo = MEDICINE_DATABASE[detectedKey];

    // Simulated scanning process
    const duration = 2400; // 2.4 seconds
    const intervalTime = 50;
    const totalSteps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setScanProgress(progress);

      // Status text updates
      if (progress < 25) {
        setScanStatusText("Initializing premium scanner & enhancing contrast...");
      } else if (progress < 50) {
        setScanStatusText("Running edge detection and isolating text lines...");
      } else if (progress < 75) {
        setScanStatusText("Processing character recognition (OCR)...");
      } else if (progress < 95) {
        setScanStatusText("Verifying match details with medicine database...");
      } else {
        setScanStatusText("Analysis finalized!");
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setMatchedMedicine(matchInfo);
          setStep("completed");
          toast.success(`Successfully identified: ${matchInfo.name}!`);
        }, 300);
      }
    }, intervalTime);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        runScanAnalysis(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-glow)] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Photo Diagnosis Scanner
          </DialogTitle>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Idle (Upload or Take Photo Option) */}
            {step === "idle" && !useWebcam && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl p-6 text-center cursor-pointer bg-secondary/20"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4 text-primary">
                  <Upload className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Upload Medicine Photo</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                  Drag and drop an image of your medicine pack/bottle or choose a local file.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                    style={{ background: "var(--gradient-hero)" }}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Browse Photos
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card text-foreground font-semibold hover:bg-secondary active:scale-[0.98] transition-all text-sm"
                  >
                    <Camera className="h-4 w-4 text-primary" />
                    Use Web Camera
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Sample Test Options */}
                <div className="mt-8 pt-6 border-t border-border w-full">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Or try a demo medicine sample
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        name: "Paracetamol 500mg",
                        key: "paracetamol",
                        icon: "💊",
                        colorStart: "#0ea5e9",
                        colorEnd: "#0284c7",
                      },
                      {
                        name: "Ibuprofen 400mg",
                        key: "ibuprofen",
                        icon: "🧪",
                        colorStart: "#f43f5e",
                        colorEnd: "#e11d48",
                      },
                      {
                        name: "Amoxicillin 500mg",
                        key: "amoxicillin",
                        icon: "📦",
                        colorStart: "#10b981",
                        colorEnd: "#059669",
                      },
                      {
                        name: "Cetirizine 10mg",
                        key: "cetirizine",
                        icon: "💧",
                        colorStart: "#8b5cf6",
                        colorEnd: "#7c3aed",
                      },
                    ].map((sample) => (
                      <button
                        key={sample.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          const canvas = document.createElement("canvas");
                          canvas.width = 500;
                          canvas.height = 360;
                          const ctx = canvas.getContext("2d");
                          if (ctx) {
                            // High fidelity stylized pill box
                            const grad = ctx.createLinearGradient(0, 0, 500, 360);
                            grad.addColorStop(0, sample.colorStart);
                            grad.addColorStop(1, sample.colorEnd);
                            ctx.fillStyle = grad;
                            ctx.fillRect(0, 0, 500, 360);

                            // Render a glossy metallic overlay
                            ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(500, 0);
                            ctx.lineTo(0, 360);
                            ctx.closePath();
                            ctx.fill();

                            // Render rounded pill blister grid pattern in background
                            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                            for (let r = 0; r < 3; r++) {
                              for (let c = 0; c < 4; c++) {
                                ctx.beginPath();
                                ctx.arc(70 + c * 120, 70 + r * 110, 24, 0, Math.PI * 2);
                                ctx.fill();
                              }
                            }

                            // Draw central clean white medical label
                            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                            ctx.beginPath();
                            if (typeof (ctx as any).roundRect === "function") {
                              (ctx as any).roundRect(80, 110, 340, 140, 20);
                            } else {
                              ctx.rect(80, 110, 340, 140);
                            }
                            ctx.fill();

                            // Draw double premium brand border
                            ctx.strokeStyle = "rgba(18, 185, 177, 0.3)";
                            ctx.lineWidth = 3;
                            ctx.stroke();

                            // Brand Icon/Cross
                            ctx.fillStyle = sample.colorStart;
                            ctx.font = "bold 28px 'Plus Jakarta Sans', sans-serif";
                            ctx.fillText("✚", 105, 160);

                            // Pharmacy brand name
                            ctx.fillStyle = "#64748b";
                            ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
                            ctx.fillText("MEDILY PHARMACEUTICALS", 145, 145);

                            // Active ingredient title text
                            ctx.fillStyle = "#0f172a";
                            ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
                            ctx.fillText(sample.name.split(" ")[0], 145, 180);

                            // Strength sub-text
                            ctx.fillStyle = sample.colorStart;
                            ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
                            ctx.fillText(sample.name.split(" ")[1] || "", 145, 205);

                            // Generic subtitle / warning banner
                            ctx.fillStyle = "#ef4444";
                            ctx.fillRect(80, 222, 340, 6);
                            ctx.fillStyle = "#94a3b8";
                            ctx.font = "500 10px 'Plus Jakarta Sans', sans-serif";
                            ctx.fillText(
                              "Rx Only • 10 Tablets • Keep out of reach of children",
                              145,
                              242,
                            );

                            const dataUrl = canvas.toDataURL("image/jpeg");
                            setImageSrc(dataUrl);
                            runScanAnalysis(`${sample.key}_pack_label.jpg`);
                          }
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-secondary/40 transition-all text-left text-xs font-semibold cursor-pointer shadow-sm hover:scale-[1.01]"
                      >
                        <span className="text-lg p-1.5 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0">
                          {sample.icon}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">
                            {sample.name.split(" ")[0]}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {sample.name.split(" ")[1]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Webcam Live Capture View */}
            {useWebcam && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative overflow-hidden rounded-2xl bg-black border border-border"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-[300px] object-cover"
                />
                <div className="absolute inset-0 border-[3px] border-primary/40 m-6 rounded-lg pointer-events-none">
                  {/* Camera guides */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                </div>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                  <button
                    onClick={capturePhoto}
                    className="h-12 px-6 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-105 active:scale-95 transition-all text-sm shadow-md"
                    style={{ background: "var(--gradient-hero)" }}
                  >
                    Capture Scan
                  </button>
                  <button
                    onClick={() => {
                      stopCamera();
                      setUseWebcam(false);
                    }}
                    className="h-12 px-6 bg-card text-foreground font-semibold border border-border rounded-full hover:bg-secondary transition-all text-sm shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Analyzing (Scanning Laser & Progress) */}
            {step === "analyzing" && imageSrc && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="relative w-full h-[220px] rounded-2xl overflow-hidden bg-secondary/30 border border-border">
                  <img
                    src={imageSrc}
                    alt="Scanning target"
                    className="w-full h-full object-contain"
                  />
                  {/* Glowing Laser Scan Bar */}
                  <motion.div
                    animate={{
                      top: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.2,
                      ease: "easeInOut",
                    }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_2px_var(--color-primary)] z-10"
                  />
                  {/* Scanner Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,185,177,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(18,185,177,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-primary flex items-center gap-1.5">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {scanStatusText}
                    </span>
                    <span className="text-muted-foreground">{scanProgress}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.1 }}
                      style={{ background: "var(--gradient-hero)" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Analysis Completed (Show Results & Call-to-action) */}
            {step === "completed" && matchedMedicine && imageSrc && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Result Card */}
                <div className="flex gap-4 p-4 border border-success/30 bg-success/5 rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center shrink-0 text-success">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-success uppercase tracking-wider">
                      Medicine Successfully Identified
                    </p>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {matchedMedicine.name}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {matchedMedicine.confidence}% Match
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Scanned Image Small View & Meta Info */}
                <div className="grid grid-cols-3 gap-4 border border-border p-4 rounded-2xl bg-secondary/10">
                  <div className="col-span-1 h-20 rounded-xl overflow-hidden border border-border">
                    <img
                      src={imageSrc}
                      alt="Scanned thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col justify-center space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{matchedMedicine.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                      <Pill className="h-3.5 w-3.5 text-primary" />
                      <span>{matchedMedicine.activeIngredients}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="text-sm text-muted-foreground leading-relaxed bg-secondary/20 p-3.5 rounded-xl border border-border/40">
                  {matchedMedicine.description}
                </div>

                {/* Medical Disclaimer */}
                <div className="flex gap-2 text-xs text-muted-foreground/80 leading-relaxed">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>Disclaimer:</strong> Image identification is simulated for preview.
                    Always consult a licensed pharmacist or physician to verify medications.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      onSearch(matchedMedicine.name);
                      onClose();
                    }}
                    className="flex-1 h-12 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                    style={{ background: "var(--gradient-hero)" }}
                  >
                    Search Stores for {matchedMedicine.name}
                  </button>
                  <button
                    onClick={resetScanner}
                    className="px-5 h-12 border border-border bg-card hover:bg-secondary font-semibold rounded-full transition-all text-sm text-muted-foreground hover:text-foreground flex items-center justify-center"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
