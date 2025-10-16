import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileUploadCard } from "@/components/features/files/FileUploadCard";
import { UploadedFileCard } from "@/components/features/files/UploadedFileCard";
import { Upload as UploadIcon, AlertCircle, Loader2, FileStack, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_FILES_URL = "http://localhost:8000/api/files/";
const API_NOTES_URL = "http://localhost:8000/api/notes/";

// Componente principal
export default function UploadPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 🔹 Cargar archivos y notas al iniciar
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("User not authenticated.");
          return;
        }

        const res = await axios.get(API_FILES_URL, {
          headers: { Authorization: `Token ${token}` },
        });

        // Manejar respuesta paginada
        if (res.data && Array.isArray(res.data.results)) {
          setFiles(res.data.results);
        } else {
          console.error("Unexpected response:", res.data);
          setErrorMessage("Unexpected response format from server.");
        }
      } catch (err) {
        console.error("Error fetching files:", err);
        setErrorMessage("Error loading files. Please refresh.");
      } finally {
        setLoadingFiles(false);
      }
    };

    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("User not authenticated.");
          return;
        }

        const res = await axios.get(API_NOTES_URL, {
          headers: { Authorization: `Token ${token}` },
        });

        // Manejar respuesta paginada
        if (res.data && Array.isArray(res.data.results)) {
          setNotes(res.data.results);
        } else {
          console.error("Unexpected response:", res.data);
          setErrorMessage("Unexpected response format from server.");
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
        setErrorMessage("Error loading notes. Please refresh.");
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchFiles();
    fetchNotes();
  }, []);

  // 🔹 Manejar subida de archivo
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    if (!selectedNoteId) {
      setErrorMessage("Please select a note to associate the file with.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErrorMessage("User not authenticated.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", selectedFile.name); // Asegurarse de enviar el nombre del archivo
      formData.append("note", selectedNoteId); // ID de la nota asociada

      const res = await axios.post(API_FILES_URL, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFiles((prev) => [...prev, res.data]); // Agregar el nuevo archivo a la lista
      setSuccessMessage("File uploaded successfully!");
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setErrorMessage(
        err.response?.data?.detail || "Error uploading file. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Manejar eliminación de archivo
  const handleFileDelete = async (fileId: number) => {
    setDeletingFileId(fileId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErrorMessage("User not authenticated.");
        return;
      }

      await axios.delete(`${API_FILES_URL}${fileId}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setFiles((prev) => prev.filter((file) => file.id !== fileId)); // Eliminar archivo de la lista
      setSuccessMessage("File deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting file:", err);
      setErrorMessage(
        err.response?.data?.detail || "Error deleting file. Please try again."
      );
    } finally {
      setDeletingFileId(null);
    }
  };

  // 🔹 Render principal
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <UploadIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">File Upload</h1>
            <p className="text-muted-foreground text-sm">
              Upload documents to your notes for AI processing
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {successMessage && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select a Note</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingNotes ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading notes...
              </span>
            </div>
          ) : notes.length > 0 ? (
            <Select
              value={selectedNoteId}
              onValueChange={(value) => setSelectedNoteId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a note to attach files to" />
              </SelectTrigger>
              <SelectContent>
                {notes.map((note) => (
                  <SelectItem key={note.id} value={note.id.toString()}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{note.title || `Note ${note.id}`}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No notes available. Create a note first!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload */}
      {selectedNoteId && (
        <div className="space-y-4">
          <FileUploadCard
            onFileSelect={(file) => setSelectedFile(file)}
            selectedFile={selectedFile}
            onClearFile={() => setSelectedFile(null)}
            isUploading={loading}
          />

          {selectedFile && (
            <Button
              onClick={handleFileUpload}
              disabled={loading}
              className="w-full gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" />
                  Upload File
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Uploaded Files */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileStack className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              Uploaded Files
            </h2>
          </div>
          {files.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loadingFiles ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading files...</p>
              </div>
            </CardContent>
          </Card>
        ) : files.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FileStack className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground mb-2">
                  No files uploaded yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload your first file to get started
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <UploadedFileCard
                key={file.id}
                file={file}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
