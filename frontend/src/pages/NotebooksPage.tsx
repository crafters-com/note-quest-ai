import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/hooks/useData";
import { notebookService, type Notebook } from "@/services/notebookService";

// --- Tus componentes de UI ---
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CreateNotebookModal } from "@/components/features/notebooks/CreateNotebookModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { Filter, Grid3X3, List, Plus, Search, Folder, Tag } from "lucide-react";

// --- Componentes para mostrar cada Notebook ---
const NotebookCard = ({ notebook }: { notebook: Notebook }) => (
  <Link to={`/notebooks/${notebook.id}/notes`}>
    <Card className="p-4 hover:bg-accent transition-colors">
      <div className="flex items-center gap-3">
        <Folder className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-bold">{notebook.name}</h3>
          <p className="text-sm text-muted-foreground">{notebook.subject}</p>
        </div>
      </div>
    </Card>
  </Link>
);

const NotebookListItem = ({ notebook }: { notebook: Notebook }) => (
  <Link to={`/notebooks/${notebook.id}/notes`}>
    <Card className="p-3 hover:bg-accent transition-colors">
      <div className="flex items-center gap-3">
        <Folder className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-semibold">{notebook.name}</h3>
          <p className="text-sm text-muted-foreground">{notebook.subject}</p>
        </div>
      </div>
    </Card>
  </Link>
);

// --- El componente de página ---
const NotebooksPage = () => {
  const { data: notebooks, loading, error, setData: setNotebooks } = useData<Notebook[]>(
    () => notebookService.getNotebooks()
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNotebookCreated = (newNotebook: Notebook) => {
    setNotebooks((prevNotebooks) => (prevNotebooks ? [newNotebook, ...prevNotebooks] : [newNotebook]));
    setIsModalOpen(false);
  };

  const subjects = ["Todos", ...new Set(notebooks?.map((n) => n.subject) ?? [])];
  const filteredNotebooks = notebooks?.filter((notebook) => {
      const matchesSearch =
        notebook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notebook.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject =
        selectedSubject === "Todos" || notebook.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    }) ?? [];

  if (loading) return <div>Cargando notebooks...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Notebooks</h1>
          <p className="text-muted-foreground">
            Organiza tus apuntes en carpetas temáticas
          </p>
        </div>
        <Button className="w-fit" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Notebook
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o materia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                {selectedSubject}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {subjects.map((subject) => (
                <DropdownMenuItem key={subject} onClick={() => setSelectedSubject(subject)}>
                  {subject}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex border rounded-md">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")} className="rounded-r-none">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="rounded-l-none">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Folder className="h-6 w-6 text-primary" />
            <div>
              <p className="text-2xl font-bold">{notebooks?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Total de Notebooks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Tag className="h-6 w-6 text-secondary" />
            <div>
              <p className="text-2xl font-bold">{subjects.length - 1}</p>
              <p className="text-sm text-muted-foreground">Materias Únicas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notebooks Grid/List */}
      <div>
        {filteredNotebooks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron notebooks</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedSubject !== "Todos"
                  ? "Intenta ajustar tus filtros de búsqueda."
                  : "Comienza creando tu primer notebook."}
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Notebook
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
            {filteredNotebooks.map((notebook) =>
              viewMode === "grid" ? (
                <NotebookCard key={notebook.id} notebook={notebook} />
              ) : (
                <NotebookListItem key={notebook.id} notebook={notebook} />
              )
            )}
          </div>
        )}
      </div>

      {/* Modal para crear notebooks */}
      <CreateNotebookModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleNotebookCreated}
      />
    </div>
  );
};

export default NotebooksPage;