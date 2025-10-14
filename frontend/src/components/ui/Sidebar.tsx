import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { NotebookDropdown } from "@/components/features/notebooks/NotebookDropdown";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { cn } from "@/utils/cn";
import {
  BookOpen,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Upload,
  User,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoSvg from "@/assets/icons/logo.svg";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Amigos",
    href: "/friends",
    icon: User,
  },
  {
    name: "Mis notebooks",
    href: "/notebooks",
    icon: BookOpen,
  },
  {
    name: "Subir Apuntes",
    href: "/upload",
    icon: Upload,
  },
  {
    name: "Quizzes",
    href: "/quizzes",
    icon: HelpCircle,
  },
];

const SidebarContent: React.FC = () => {
  const pathname = useLocation();
  const authData = useAuth(); 
  console.log("Datos del AuthContext en Sidebar:", authData); 
  const { user, logout } = authData;
  

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="relative">
          <img src={LogoSvg} alt="Logo" className="h-10 w-10" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground">
            NoteQuest-AI
          </span>
          <span className="text-xs text-muted-foreground">
            Gestión inteligente
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Notebooks section */}
      <div className="border-t">
        <div className="py-2">
          <div className="px-3 py-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Notebook Activo
            </span>
          </div>
          <NotebookDropdown />
        </div>
        
        {/* User actions */}
        <div className="border-t p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <div className="hidden xl:flex xl:w-64 xl:flex-col xl:fixed xl:inset-y-0 xl:z-50 xl:bg-card xl:border-r">
      <SidebarContent />
    </div>
  );
};

export const MobileSidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="xl:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 gap-0">
        <SheetTitle className="h-0" />
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
};