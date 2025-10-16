import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  File,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface UploadedFile {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  processing_status: "queued" | "processing" | "done" | "error";
  processing_error?: string;
  file: string;
}

interface UploadedFileCardProps {
  file: UploadedFile;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5" />,
  docx: <FileText className="w-5 h-5" />,
  xlsx: <FileSpreadsheet className="w-5 h-5" />,
  pptx: <FileSpreadsheet className="w-5 h-5" />,
  png: <ImageIcon className="w-5 h-5" />,
  jpg: <ImageIcon className="w-5 h-5" />,
  jpeg: <ImageIcon className="w-5 h-5" />,
  txt: <FileCode className="w-5 h-5" />,
  md: <FileCode className="w-5 h-5" />,
};

const FILE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  docx: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  xlsx: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
  pptx: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  png: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  jpg: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  jpeg: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  txt: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  md: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
};

const STATUS_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  animated?: boolean;
}> = {
  queued: {
    icon: Clock,
    label: "Queued",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800",
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
    animated: true,
  },
  done: {
    icon: CheckCircle2,
    label: "Processed",
    color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
  },
};

export function UploadedFileCard({
  file,
}: UploadedFileCardProps) {

  const fileIcon = FILE_ICONS[file.file_type] || <File className="w-5 h-5" />;
  const fileColor =
    FILE_COLORS[file.file_type] || "bg-gray-100 text-gray-600 dark:bg-gray-800";

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const statusInfo = STATUS_CONFIG[file.processing_status];
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
              fileColor
            )}
          >
            {fileIcon}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="text-sm font-medium truncate flex-1"
                  title={file.filename}
                >
                  {file.filename}
                </h3>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {file.file_type.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(file.file_size)}</span>
                <span>•</span>
                <span>{formatDate(file.uploaded_at)}</span>
              </div>
            </div>

            {/* Processing Status */}
            <div
              className={cn(
                "inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium",
                statusInfo.color
              )}
            >
              <StatusIcon
                className={cn("w-3 h-3", statusInfo.animated && "animate-spin")}
              />
              <span>{statusInfo.label}</span>
            </div>

            {/* Error Message */}
            {file.processing_status === "error" && file.processing_error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {file.processing_error}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
