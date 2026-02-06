"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExtractFromScreenshot } from "../_hooks";

export function ScreenshotUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const extractMutation = useExtractFromScreenshot();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = () => {
    if (!file) return;

    extractMutation.mutate(file, {
      onSuccess: () => {
        setFile(null);
        setPreview(null);
      },
    });
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-sm font-medium text-foreground">
            Drop your screenshot here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPEG, or WebP (max 10MB)</p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg border bg-muted p-4">
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-2 rounded-full bg-background p-1 shadow-sm hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-64 rounded object-contain"
            />
            <p className="mt-2 text-center text-sm text-muted-foreground">{file?.name}</p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={extractMutation.isPending}
            className="w-full"
          >
            {extractMutation.isPending ? "Extracting..." : "Extract & Add Tasks"}
          </Button>
        </div>
      )}
    </div>
  );
}
