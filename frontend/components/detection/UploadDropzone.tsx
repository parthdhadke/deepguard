'use client';

import { useCallback, useState } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Video, X, Check, AlertCircle } from 'lucide-react';
import type { MediaType, UploadedFile } from '@/lib/types';

interface UploadDropzoneProps {
  mediaType: MediaType;
  onFileSelect: (file: UploadedFile) => void;
  onFileClear: () => void;
  selectedFile: UploadedFile | null;
  isAnalyzing: boolean;
}

const ACCEPTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
};

const MAX_SIZE_MB = 50;

export default function UploadDropzone({
  mediaType,
  onFileSelect,
  onFileClear,
  selectedFile,
  isAnalyzing,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const acceptedTypes = ACCEPTED_TYPES[mediaType];
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.join(', ')}`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size: ${MAX_SIZE_MB}MB`;
    }
    return null;
  }, [mediaType]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const preview = URL.createObjectURL(file);
    onFileSelect({
      file,
      preview,
      type: mediaType,
      size: file.size,
      name: file.name,
    });
  }, [mediaType, onFileSelect, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="surface-strong p-5 sm:p-6"
          >
            <div className="grid gap-5 sm:grid-cols-[144px_1fr_auto] sm:items-center">
              <div className="relative h-36 overflow-hidden rounded-[1.5rem] bg-muted">
                {mediaType === 'image' ? (
                  <NextImage src={selectedFile.preview} alt="Selected upload preview" fill unoptimized className="object-cover" />
                ) : (
                  <video src={selectedFile.preview} className="h-full w-full object-cover" muted />
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Selected file</div>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">{selectedFile.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="chip">{mediaType.toUpperCase()}</span>
                  <span className="chip">{formatSize(selectedFile.size)}</span>
                  <span className="chip text-accent">
                    <Check className="h-3.5 w-3.5" />
                    Ready to analyze
                  </span>
                </div>
              </div>

              {!isAnalyzing && (
                <button
                  onClick={onFileClear}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="surface-strong p-4 sm:p-6"
          >
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative block cursor-pointer overflow-hidden rounded-[1.75rem] border border-dashed p-10 text-center transition-all sm:p-14 ${
                isDragging ? 'border-primary bg-primary/8' : 'border-border/80 bg-background/40 hover:border-primary/40'
              }`}
            >
              <input
                type="file"
                accept={ACCEPTED_TYPES[mediaType].join(',')}
                onChange={handleInputChange}
                className="absolute inset-0 h-full w-full opacity-0"
              />

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary">
                {mediaType === 'image' ? <ImageIcon className="h-7 w-7" /> : <Video className="h-7 w-7" />}
              </div>

              <h3 className="font-heading text-4xl leading-none tracking-[-0.04em] text-foreground">
                Drop your {mediaType} here
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Or click to browse from your device. Supported formats are tailored to the selected analysis mode.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="chip">Max {MAX_SIZE_MB}MB</span>
                <span className="chip">{mediaType === 'image' ? 'JPG, PNG, WebP' : 'MP4, MOV, AVI'}</span>
                <span className="chip">
                  <Upload className="h-3.5 w-3.5" />
                  Drag and drop enabled
                </span>
              </div>
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 flex items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
