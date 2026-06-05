import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Database, CheckCircle, AlertTriangle, RefreshCw, Trash2, Key, HelpCircle } from "lucide-react";
import { isFirebaseConfigured, getFirebaseConfig, seedFirebase } from "@/lib/firebase";
import { toast } from "sonner";

export function FirebaseSetup() {
  const [open, setOpen] = useState(false);
  const [configText, setConfigText] = useState("");
  const [isConfigured, setIsConfigured] = useState(isFirebaseConfigured);
  const [seeding, setSeeding] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);

  useEffect(() => {
    setIsConfigured(isFirebaseConfigured);
    const config = getFirebaseConfig();
    setCurrentConfig(config);
    if (config) {
      setConfigText(JSON.stringify(config, null, 2));
    }
  }, [open]);

  const handleSave = () => {
    try {
      let parsedConfig: any = null;
      const text = configText.trim();

      // 1. Try regex extraction (highly robust for both JS code and JSON objects)
      const keys = [
        "apiKey",
        "authDomain",
        "projectId",
        "storageBucket",
        "messagingSenderId",
        "appId",
        "measurementId"
      ];
      
      const extracted: Record<string, string> = {};
      for (const key of keys) {
        const regex = new RegExp(`['"]?${key}['"]?\\s*[:=]\\s*['"]([^'"]+)['"]`);
        const match = text.match(regex);
        if (match) {
          extracted[key] = match[1];
        }
      }

      if (extracted.apiKey && extracted.projectId) {
        parsedConfig = extracted;
      } else {
        // 2. Fallback to standard cleaning and JSON parsing if regex did not find required keys
        let cleaned = text;
        if (cleaned.includes("const firebaseConfig = {")) {
          const start = cleaned.indexOf("{");
          const end = cleaned.lastIndexOf("}") + 1;
          cleaned = cleaned.substring(start, end);
        }
        
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
        
        try {
          parsedConfig = JSON.parse(cleaned);
        } catch {
          const withQuotes = cleaned
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/'/g, '"');
          parsedConfig = JSON.parse(withQuotes);
        }
      }

      const requiredKeys = ["apiKey", "projectId"];
      const missing = requiredKeys.filter(k => !parsedConfig?.[k]);

      if (missing.length > 0) {
        toast.error(`Invalid Firebase config: missing ${missing.join(", ")}`);
        return;
      }

      localStorage.setItem("firebase_config", JSON.stringify(parsedConfig));
      toast.success("Firebase configuration saved! Reloading application...");
      setOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to parse config. Please make sure it is a valid JSON object or script snippet.");
    }
  };

  const handleReset = () => {
    localStorage.removeItem("firebase_config");
    toast.success("Firebase configuration reset. Reloading application...");
    setOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleSeed = async () => {
    setSeeding(true);
    toast.info("Connecting and seeding database...");
    const success = await seedFirebase();
    setSeeding(false);
    if (success) {
      toast.success("Firestore seeded successfully with default pharmacies and medicines!");
    } else {
      toast.warning("Seeding skipped or failed (collections may already contain data or Firebase permissions denied).");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary border border-border text-foreground hover:border-primary/40 transition cursor-pointer"
          title="Database Settings"
        >
          <Database className="h-3.5 w-3.5" />
          <span>DB: Firebase</span>
          <span className={`h-1.5 w-1.5 rounded-full ${isConfigured ? "bg-success" : "bg-destructive"}`} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Database Settings</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure your application to retrieve medicines and stores from your own Firebase project.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Status Panel */}
          <div className={`p-4 rounded-2xl border ${isConfigured ? "bg-success/5 border-success/20 text-success-foreground" : "bg-destructive/5 border-destructive/20 text-destructive-foreground"} flex items-start gap-3`}>
            {isConfigured ? (
              <>
                <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">Connected to Firebase</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Project ID: <span className="font-mono bg-card px-1 py-0.5 rounded border">{currentConfig?.projectId}</span>
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Authentication and Firestore are active. Searches are queried live from your database.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">Firebase Not Configured</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Please paste your Firebase Web SDK Config below to connect a live database.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Setup Instructions */}
          <div className="bg-secondary/40 rounded-2xl p-4 border border-border text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>How to configure Firebase:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Firebase Console</a>.</li>
              <li>Add a Web App to your project.</li>
              <li>Copy the <code className="bg-card px-1 py-0.5 border rounded">firebaseConfig</code> Javascript object.</li>
              <li>Paste the code or JSON object below and save.</li>
            </ol>
          </div>

          {/* Config Input Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Key className="h-3 w-3" />
              <span>Firebase Web SDK Configuration</span>
            </label>
            <textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "your-project.firebaseapp.com",\n  "projectId": "your-project",\n  "storageBucket": "your-project.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
              className="w-full h-32 bg-secondary border border-border rounded-xl p-3 text-xs font-mono outline-none focus:border-primary/50 placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition cursor-pointer"
              >
                Save & Initialize
              </button>

              {currentConfig && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-10 px-3 rounded-xl border border-border bg-card text-destructive hover:bg-destructive/10 transition cursor-pointer"
                  title="Remove custom Firebase Config"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {isConfigured && (
              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className="w-full h-9 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {seeding ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Database className="h-3 w-3" />
                )}
                Seed Default Pharmacies & Medicines to Firestore
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
