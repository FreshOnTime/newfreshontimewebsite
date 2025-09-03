"use client";

import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  value: File | null;
  disabled?: boolean;
  aspectRatio?: number;
}

export function ImageUpload({
  onChange,
  value,
  disabled,
  aspectRatio,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);

  // Update preview when file changes
  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [value]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setRejectedFiles([]);
      const file = acceptedFiles[0];

      if (file) {
        try {
          onChange(file);
        } catch (error) {
          setRejectedFiles([`${file.name}: ${error}`]);
        }
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    disabled,
    multiple: false,
  });

  // Update the preview section
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer",
          isDragActive && "border-primary bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <ImagePlus className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            Drag & drop or click to upload images
          </p>
          {aspectRatio && (
            <p className="text-xs text-gray-400">
              Recommended aspect ratio: {aspectRatio}
            </p>
          )}
        </div>
      </div>

      {rejectedFiles.length > 0 && (
        <div className="text-sm text-red-500 space-y-1">
          {rejectedFiles.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {preview && (
        <div className="relative group aspect-square w-full max-w-[200px]">
          <Image
            src={preview}
            alt="Upload preview"
            className="object-cover rounded-lg"
            fill
          />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setPreview(null);
            }}
            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
