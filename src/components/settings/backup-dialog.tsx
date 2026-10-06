"use client";

import { useState, useRef } from "react";
import { Download, Upload, AlertTriangle, CheckCircle, Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BackupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => void;
  onImport: (jsonData: unknown) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
}

export function BackupDialog({
  isOpen,
  onOpenChange,
  onExport,
  onImport,
}: BackupDialogProps) {
  const [importStatus, setImportStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });
  const [pendingData, setPendingData] = useState<unknown | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        setPendingData(parsed);
        setConfirmReplace(true);
        setImportStatus({ type: "idle" });
      } catch {
        setImportStatus({
          type: "error",
          message: "The uploaded file is not a valid JSON document.",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const executeImport = async () => {
    if (!pendingData) return;
    const res = await onImport(pendingData);
    if (res.success) {
      setImportStatus({
        type: "success",
        message: "Your expenses data was successfully imported and restored!",
      });
      setConfirmReplace(false);
      setPendingData(null);
    } else {
      setImportStatus({
        type: "error",
        message: res.error || "Failed to validate imported tracker data.",
      });
      setConfirmReplace(false);
      setPendingData(null);
    }
  };

  const handleClose = () => {
    setConfirmReplace(false);
    setPendingData(null);
    setImportStatus({ type: "idle" });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            <span>Data Backup & Restore</span>
          </DialogTitle>
          <DialogDescription>
            Export all monthly income, expenses, and budget settings to a JSON file or restore from a backup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {importStatus.type === "success" && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-3 text-xs text-[#00d68f]">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{importStatus.message}</span>
            </div>
          )}

          {importStatus.type === "error" && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-900/60 p-3 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{importStatus.message}</span>
            </div>
          )}

          {confirmReplace ? (
            <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-200">
                    Replace existing data?
                  </h4>
                  <p className="text-xs text-amber-400/90 mt-1">
                    Restoring from backup will replace the current data stored in your browser. Are you sure you want to proceed?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfirmReplace(false);
                    setPendingData(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={executeImport}
                  className="text-xs"
                >
                  Yes, Replace & Restore
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#1b2844] bg-[#090f1d] p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Export Backup
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Download full JSON data file
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </Button>
              </div>

              <div className="rounded-xl border border-[#1b2844] bg-[#090f1d] p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Restore from Backup
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a previously exported JSON file
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Select File</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
