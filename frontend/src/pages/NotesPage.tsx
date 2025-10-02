import { notebookService } from '@/services/notebookService';

import {Card, CardContent} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import {
  Calendar,
  FileText,
  Filter,
  Grid3X3,
  List,
  Plus,
  Search,
  Tag,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import NoteListItem from "@/components/features/notes/NoteListItem";
import NoteCard from "@/components/features/notes/NoteCard";


// Mock data for notes
const mockNotes = [
  {
    id: 1,
    title: "Introducción a React",
    description: "Conceptos básicos de React, componentes y JSX",
    subject: "Programación",
    date: "2024-01-15",
    pages: 12,
    tags: ["React", "JavaScript", "Frontend"],
    type: "PDF",
  },
  {
    id: 2,
    title: "Cálculo Diferencial",
    description: "Límites, derivadas y aplicaciones",
    subject: "Matemáticas",
    date: "2024-01-14",
    pages: 8,
    tags: ["Cálculo", "Derivadas", "Matemáticas"],
    type: "PDF",
  },
  {
    id: 3,
    title: "Historia del Arte Moderno",
    description: "Movimientos artísticos del siglo XX",
    subject: "Arte",
    date: "2024-01-13",
    pages: 15,
    tags: ["Arte", "Historia", "Siglo XX"],
    type: "PDF",
  },
  {
    id: 4,
    title: "Química Orgánica - Capítulo 3",
    description: "Hidrocarburos y grupos funcionales",
    subject: "Química",
    date: "2024-01-12",
    pages: 10,
    tags: ["Química", "Orgánica", "Hidrocarburos"],
    type: "PDF",
  },
  {
    id: 5,
    title: "Análisis de Datos con Python",
    description: "Pandas, NumPy y visualización de datos",
    subject: "Programación",
    date: "2024-01-11",
    pages: 20,
    tags: ["Python", "Datos", "Pandas"],
    type: "PDF",
  },
  {
    id: 6,
    title: "Filosofía Contemporánea",
    description: "Corrientes filosóficas actuales",
    subject: "Filosofía",
    date: "2024-01-10",
    pages: 18,
    tags: ["Filosofía", "Contemporánea", "Pensamiento"],
    type: "PDF",
  },
];
const subjects = [
  "Todos",
  "Programación",
  "Matemáticas",
  "Arte",
  "Química",
  "Filosofía",
];

const NotesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredNotes = mockNotes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesSubject =
      selectedSubject === "Todos" || note.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Apuntes</h1>
          <p className="text-muted-foreground">
            Gestiona y organiza tu biblioteca de conocimiento
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Subir Apuntes
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar apuntes, materias o etiquetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                {selectedSubject}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {subjects.map((subject) => (
                <DropdownMenuItem
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockNotes.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total de apuntes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subjects.length - 1}</p>
                <p className="text-sm text-muted-foreground">Materias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Esta semana</p>
                <p className="text-sm text-muted-foreground">
                  Última actividad
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Grid/List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredNotes.length} apunte
            {filteredNotes.length !== 1 ? "s" : ""} encontrado
            {filteredNotes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron apuntes
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedSubject !== "Todos"
                  ? "Intenta ajustar tus filtros de búsqueda"
                  : "Comienza subiendo tus primeros apuntes"}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Subir Apuntes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-3"
            }
          >
            {filteredNotes.map((note) =>
              viewMode === "grid" ? (
                <NoteCard key={note.id} note={note} />
              ) : (
                <NoteListItem key={note.id} note={note} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;