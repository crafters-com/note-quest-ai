import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    setLoading(true);
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
      setLoading(false);
    }
  };

  // 🔹 Render principal
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-primary">File Upload</h1>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

      {/* Seleccionar nota */}
      <Card className="p-4 bg-muted/30 border border-border">
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          <Select
            value={selectedNoteId}
            onValueChange={(value) => setSelectedNoteId(value)}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a note" />
            </SelectTrigger>
            <SelectContent>
              {notes.map((note) => (
                <SelectItem key={note.id} value={note.id.toString()}>
                  {note.title || `Note ${note.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Subir archivo */}
      <Card className="p-4 bg-muted/30 border border-border">
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          <Input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="flex-1"
          />
          <Button
            onClick={handleFileUpload}
            disabled={loading || !selectedFile || !selectedNoteId}
            className="flex items-center gap-2"
          >
            {loading ? "Uploading..." : "Upload File"}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de archivos */}
      <h2 className="text-xl font-medium text-foreground">Uploaded Files</h2>
      <div className="space-y-3">
        {files.length === 0 ? (
          <p className="text-muted-foreground text-sm">No files uploaded yet.</p>
        ) : (
          files.map((file) => (
            <Card key={file.id} className="border border-border">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-col">
                  <a
                    href={file.file} // URL del archivo
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {file.filename || `File ${file.id}`}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    Uploaded: {new Date(file.uploaded_at).toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleFileDelete(file.id)}
                  aria-label={`Delete file ${file.filename}`}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
