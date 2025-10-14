import React from 'react';
import { useNotebook } from '@/context/NotebookContext';
import { useData } from '@/hooks/useData';
import { noteService, type Note } from '@/services/noteService';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  FileText, 
  Plus, 
  Calendar, 
  BookOpen,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

const DashboardPage = () => {
  const { selectedNotebook, notebooks } = useNotebook();
  
  const { data: notes, loading, error } = useData<Note[]>(
    () => selectedNotebook ? noteService.getNotes(selectedNotebook.id) : Promise.resolve([]),
    [selectedNotebook?.id]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  // Stats del notebook seleccionado
  const totalNotes = notes?.length || 0;
  const recentNotes = notes?.slice(0, 5) || [];
  const totalNotebooks = notebooks?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedNotebook 
              ? `Notas de "${selectedNotebook.name}" - ${selectedNotebook.subject}`
              : 'Selecciona un notebook para ver tus notas'
            }
          </p>
        </div>
        {selectedNotebook && (
          <Link to={`/notebooks/${selectedNotebook.id}/notes`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Nota
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotes}</div>
            <p className="text-xs text-muted-foreground">
              {selectedNotebook ? `en ${selectedNotebook.name}` : 'en todos los notebooks'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notebooks Totales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotebooks}</div>
            <p className="text-xs text-muted-foreground">
              carpetas de estudio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentNotes.length}</div>
            <p className="text-xs text-muted-foreground">
              notas recientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      {!selectedNotebook ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selecciona un Notebook</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Para ver tus notas y empezar a estudiar, selecciona un notebook del menú lateral.
            </p>
            <Link to="/notebooks">
              <Button variant="outline">
                Ver todos los Notebooks
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : totalNotes === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay notas aún</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Este notebook está vacío. ¡Crea tu primera nota para empezar a estudiar!
            </p>
            <Link to={`/notebooks/${selectedNotebook.id}/notes`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Nota
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Notas recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Notas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="">
                {recentNotes.map((note, index) => (
                  <Link key={note.id} to={`/notes/${note.id}`}>
                    <div className={`flex items-center gap-4 py-4 px-2 hover:bg-accent/30 rounded-lg transition-all duration-200 group ${index === 0 ? 'pt-2' : ''} ${index === recentNotes.length - 1 ? 'pb-2' : ''}`}>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate text-lg mb-1">{note.title}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(note.updated_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {recentNotes.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      No hay notas recientes
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Las notas que crees aparecerán aquí
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link to={`/notebooks/${selectedNotebook.id}/notes`}>
                  <Button variant="outline" className="w-full justify-start h-12 text-base mb-4">
                    <Plus className="mr-3 h-5 w-5" />
                    Crear Nueva Nota
                  </Button>
                </Link>
                
                <Link to="/notebooks">
                  <Button variant="outline" className="w-full justify-start h-12 text-base mb-4">
                    <BookOpen className="mr-3 h-5 w-5" />
                    Ver Todos los Notebooks
                  </Button>
                </Link>
                
                <Link to="/upload">
                  <Button variant="outline" className="w-full justify-start h-12 text-base">
                    <FileText className="mr-3 h-5 w-5" />
                    Subir Apuntes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de todas las notas si hay más de 5 */}
      {totalNotes > 5 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Todas las Notas</CardTitle>
              <Link to={`/notebooks/${selectedNotebook?.id}/notes`}>
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {notes?.slice(5).map((note) => (
                <Link key={note.id} to={`/notes/${note.id}`}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{note.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(note.updated_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;