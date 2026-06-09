"use client";

import React, { useMemo } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export function FileUploader({
  value,
  onChange,
  accept = ".pdf,.doc,.docx,.xlsx,.txt,.jpg,.jpeg,.png,.zip",
  maxSizeMB = 50,
  label = "Upload File",
}: FileUploaderProps) {
  const preview = useMemo(() => {
    if (!value) return null;

    return {
      name: value.name,
      size: `${(value.size / 1024 / 1024).toFixed(2)} MB`,
      type: value.type,
    };
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(
        `File size must be less than ${maxSizeMB}MB. Selected file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
      // Clear input
      event.target.value = "";
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(",").map((t) => t.trim());
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`File type must be one of: ${accept}`);
      event.target.value = "";
      return;
    }

    onChange(file);
    toast.success(`File "${file.name}" selected`);
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center transition hover:bg-muted">
          <UploadCloud className="mb-3 size-10 text-muted-foreground" />

          <div className="space-y-1">
            <p className="font-medium">{label}</p>

            <p className="text-sm text-muted-foreground">
              {accept} up to {maxSizeMB}MB
            </p>

            <p className="text-xs text-muted-foreground">
              Click to select
            </p>
          </div>

          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-muted p-3">
              <FileText className="size-5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="line-clamp-1 text-sm font-medium">{preview.name}</p>

              <p className="text-xs text-muted-foreground">{preview.size}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              onChange(null);
              toast.success("File removed");
            }}
            aria-label="Remove file"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
