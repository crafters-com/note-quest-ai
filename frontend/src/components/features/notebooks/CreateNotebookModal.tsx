import { useState } from "react";
import { notebookService, type NotebookData, Notebook } from "@/services/notebookService";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";

interface CreateNotebookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newNotebook: Notebook) => void; // Función para notificar al padre
}

export const CreateNotebookModal = ({ open, onOpenChange, onSuccess }: CreateNotebookModalProps) => {
  const [formData, setFormData] = useState<NotebookData>({
    name: "",
    subject: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newNotebook = await notebookService.createNotebook(formData);
      onSuccess(newNotebook); // Llama a la función de éxito del padre
    } catch (err) {
      setError("No se pudo crear el notebook. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Notebook</DialogTitle>
          <DialogDescription>
            Dale un nombre y una materia a tu nueva carpeta de apuntes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="create-notebook-form" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Notebook</Label>
            <Input id="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Materia</Label>
            <Input id="subject" value={formData.subject} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input id="description" value={formData.description} onChange={handleInputChange} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" form="create-notebook-form" disabled={loading}>
            {loading ? "Creando..." : "Crear Notebook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};