import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { readMarkdownFile, validateMarkdownFile } from '@/utils/fileUtils';

interface ImportMarkdownModalProps {
  onImport: (title: string, content: string) => Promise<void>;
  notebookId: number;
  trigger?: React.ReactNode;
}

const ImportMarkdownModal = ({ onImport, notebookId, trigger }: ImportMarkdownModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewTitle('');
    setPreviewContent('');
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    // Validar archivo
    const validation = validateMarkdownFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido');
      return;
    }

    setSelectedFile(file);
    
    try {
      // Leer y procesar archivo
      const { title, content } = await readMarkdownFile(file);
      setPreviewTitle(title);
      setPreviewContent(content);
    } catch (err: any) {
      setError(err.message || 'Error al leer el archivo');
      setSelectedFile(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !previewTitle.trim()) return;

    setIsLoading(true);
    try {
      await onImport(previewTitle, previewContent);
      setIsOpen(false);
      resetModal();
    } catch (err: any) {
      setError(err.message || 'Error al importar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="default">
            <Upload className="h-4 w-4 mr-2" />
            Importar MD
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar archivo Markdown</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de archivo */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Seleccionar archivo</Label>
            <div className="flex items-center gap-3">
              <Input
                id="file-upload"
                type="file"
                accept=".md,.markdown"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {selectedFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewTitle('');
                    setPreviewContent('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Vista previa */}
          {selectedFile && !error && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{selectedFile.name}</span>
                <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>

              {/* Título editable */}
              <div className="space-y-2">
                <Label htmlFor="note-title">Título de la nota</Label>
                <Input
                  id="note-title"
                  value={previewTitle}
                  onChange={(e) => setPreviewTitle(e.target.value)}
                  placeholder="Ingresa un título para la nota"
                />
              </div>

              {/* Vista previa del contenido */}
              <div className="space-y-2">
                <Label>Vista previa del contenido</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto bg-muted/30">
                  <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {previewContent || 'El archivo está vacío'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || !previewTitle.trim() || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Importando...
                </div>
              ) : (
                'Importar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportMarkdownModal;