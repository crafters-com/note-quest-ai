import React, { useState } from 'react';
import { useNotebook } from '@/context/NotebookContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/Dropdown';
import { BookOpen, ChevronUp, Plus, Folder } from 'lucide-react';
import { CreateNotebookModal } from '@/components/features/notebooks/CreateNotebookModal';
import type { Notebook } from '@/services/notebookService';

export const NotebookDropdown: React.FC = () => {
  const { notebooks, selectedNotebook, setSelectedNotebook, loading } = useNotebook();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotebookSelect = (notebook: Notebook) => {
    setSelectedNotebook(notebook);
    // Navegar a las notas del notebook seleccionado
    navigate(`/notebooks/${notebook.id}/notes`);
  };

  const handleNotebookCreated = (newNotebook: Notebook) => {
    setSelectedNotebook(newNotebook);
    setIsModalOpen(false);
    // Navegar al nuevo notebook
    navigate(`/notebooks/${newNotebook.id}/notes`);
  };

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-6 w-6 bg-muted rounded"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!notebooks || notebooks.length === 0) {
    return (
      <div className="px-3 py-2">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Crear primer notebook
        </Button>
        <CreateNotebookModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={handleNotebookCreated}
        />
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between text-sm font-normal px-4 py-4 h-auto"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Folder className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex flex-col items-start min-w-0 flex-1 space-y-1">
                <span className="font-semibold text-foreground truncate w-full text-left">
                  {selectedNotebook?.name || 'Seleccionar notebook'}
                </span>
                {selectedNotebook && (
                  <span className="text-xs text-muted-foreground truncate w-full text-left">
                    {selectedNotebook.subject}
                  </span>
                )}
              </div>
            </div>
            <ChevronUp className="h-4 w-4 flex-shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-56">
          {notebooks.map((notebook) => (
            <DropdownMenuItem
              key={notebook.id}
              onClick={() => handleNotebookSelect(notebook)}
              className="flex items-center gap-3 py-2"
            >
              <Folder className="h-4 w-4 text-primary" />
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">{notebook.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {notebook.subject}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 py-2 text-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Crear nuevo notebook</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => navigate('/notebooks')}
            className="flex items-center gap-3 py-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Ver todos los notebooks</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateNotebookModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleNotebookCreated}
      />
    </div>
  );
};