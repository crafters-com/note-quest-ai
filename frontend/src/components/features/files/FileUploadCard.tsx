import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Upload, File, X, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface FileUploadCardProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  isUploading?: boolean;
  acceptedTypes?: string;
}

export function FileUploadCard({
  onFileSelect,
  selectedFile,
  onClearFile,
  isUploading = false,
  acceptedTypes = ".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.txt,.md",
}: FileUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "FILE";
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isDragging && "border-primary bg-accent/50 shadow-lg"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-6">
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
              isDragging ? "bg-primary" : "bg-accent"
            )}>
              <Upload className={cn(
                "w-8 h-8 transition-colors",
                isDragging ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-medium">
                {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOCX, XLSX, PPTX, PNG, JPG, TXT, MD
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: 10MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept={acceptedTypes}
              className="hidden"
            />

            <Button
              variant="default"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
