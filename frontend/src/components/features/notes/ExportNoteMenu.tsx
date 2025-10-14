import { useState } from 'react';
import { Download, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/Dropdown';
import { exportNoteToPdf, exportNoteToMarkdown } from '@/utils/fileUtils';

interface ExportNoteMenuProps {
  noteTitle: string;
  noteContent: string;
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

const ExportNoteMenu = ({ 
  noteTitle, 
  noteContent, 
  variant = 'default',
  size = 'sm',
  showText = true 
}: ExportNoteMenuProps) => {
  const [isExporting, setIsExporting] = useState<'pdf' | 'md' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExportPdf = () => {
    setIsExporting('pdf');
    setError(null);
    
    try {
      exportNoteToPdf(noteTitle, noteContent);
    } catch (error: any) {
      console.error('Error al exportar PDF:', error);
      setError(error.message || 'Error al generar el archivo PDF');
      alert(`Error al exportar PDF: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportMarkdown = () => {
    setIsExporting('md');
    setError(null);
    
    try {
      exportNoteToMarkdown(noteTitle, noteContent);
    } catch (error: any) {
      console.error('Error al exportar Markdown:', error);
      setError(error.message || 'Error al generar el archivo Markdown');
      alert(`Error al exportar Markdown: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={isExporting !== null}
        >
          <Download className="h-4 w-4" />
          {showText && (
            <span className="ml-2">
              {isExporting === 'pdf' && 'Exportando PDF...'}
              {isExporting === 'md' && 'Exportando MD...'}
              {!isExporting && 'Exportar'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={handleExportPdf}
          disabled={isExporting !== null}
          className="cursor-pointer"
        >
          <File className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>Exportar como PDF</span>
            <span className="text-xs text-muted-foreground">
              Archivo portable
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleExportMarkdown}
          disabled={isExporting !== null}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>Exportar como Markdown</span>
            <span className="text-xs text-muted-foreground">
              Archivo editable
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportNoteMenu;