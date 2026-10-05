"use client";

import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  value: File | null;
  disabled?: boolean;
  aspectRatio?: number;
  existingUrl?: string | null;
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function ImageUpload({
  onChange,
  value,
  disabled,
  aspectRatio,
  existingUrl,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);

  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreview(existingUrl || null);
  }, [value, existingUrl]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setRejectedFiles([]);
      const file = acceptedFiles[0];
      if (file) onChange(file);
    },
    [onChange]
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    setRejectedFiles(rejections.map(({ file, errors }) => {
      const message = errors.some(error => error.code === "file-too-large")
        ? "Image must be 4 MB or smaller"
        : "Use a JPEG, PNG, WebP or AVIF image";
      return `${file.name}: ${message}`;
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
    },
    maxSize: MAX_IMAGE_BYTES,
    disabled,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed p-4 transition hover:bg-background",
          isDragActive && "border-primary bg-background",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drag & drop or click to upload an image</p>
          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or AVIF · max 4 MB</p>
          {aspectRatio && (
            <p className="text-xs text-muted-foreground">Recommended aspect ratio: {aspectRatio}</p>
          )}
        </div>
      </div>

      {rejectedFiles.length > 0 && (
        <div className="space-y-1 text-sm text-red-500">
          {rejectedFiles.map((error, index) => <p key={index}>{error}</p>)}
        </div>
      )}

      {preview && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{value ? "New image preview" : "Current image"}</p>
          <div
            role="img"
            aria-label={value ? "New image preview" : "Current image"}
            className="group relative aspect-square w-full max-w-[220px] rounded-lg border border-border bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${preview.replace(/"/g, '%22')}")` }}
          >
            {value && !disabled && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setRejectedFiles([]);
                }}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-90 transition hover:opacity-100"
                aria-label="Remove selected image"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!value && existingUrl && !disabled && (
            <p className="text-xs text-muted-foreground">Upload a new image above to replace the current one.</p>
          )}
        </div>
      )}
    </div>
  );
}
