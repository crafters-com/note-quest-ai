import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import { Eye, FileText, Trash2 } from "lucide-react";
import ExportNoteMenu from "./ExportNoteMenu";
import { Note } from "@/services/noteService";

export interface NoteListItemProps {
  note: Note;
  onView?: (noteId: number) => void;
  onDelete?: (noteId: number) => void;
}

const NoteListItem: React.FC<NoteListItemProps> = ({ note, onView, onDelete }) => {
  // Función para extraer una vista previa del contenido
  const getContentPreview = (content: string, maxLength: number = 100) => {
    if (!content) return "Sin contenido";
    const textContent = content.replace(/[#*`\[\]]/g, ''); // Remover markdown básico
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  const handleView = () => {
    if (onView) {
      onView(note.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(note.id);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {note.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {getContentPreview(note.content)}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Markdown</span>
                  <span>{new Date(note.updated_at).toLocaleDateString("es-ES")}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <ExportNoteMenu
                  noteTitle={note.title}
                  noteContent={note.content}
                  variant="default"
                  size="sm"
                  showText={false}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="sr-only">Opciones</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01"
                        />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleView}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteListItem;