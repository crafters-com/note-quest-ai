import { Calendar, Eye, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import ExportNoteMenu from "./ExportNoteMenu";
import { Note } from "@/services/noteService";

export interface NoteCardProps {
  note: Note;
  onView?: (noteId: number) => void;
  onDelete?: (noteId: number) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onView, onDelete }) => {
  // Función para extraer una vista previa del contenido
  const getContentPreview = (content: string, maxLength: number = 150) => {
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
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {getContentPreview(note.content)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(note.updated_at).toLocaleDateString("es-ES")}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Markdown
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;