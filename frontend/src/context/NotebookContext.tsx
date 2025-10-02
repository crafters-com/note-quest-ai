import React, { createContext, useContext, useState, useEffect } from 'react';
import { useData } from '@/hooks/useData';
import { notebookService, type Notebook } from '@/services/notebookService';

interface NotebookContextType {
  notebooks: Notebook[] | null;
  selectedNotebook: Notebook | null;
  setSelectedNotebook: (notebook: Notebook | null) => void;
  loading: boolean;
  error: string | null;
  refetchNotebooks: () => void;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const useNotebook = () => {
  const context = useContext(NotebookContext);
  if (context === undefined) {
    throw new Error('useNotebook must be used within a NotebookProvider');
  }
  return context;
};

interface NotebookProviderProps {
  children: React.ReactNode;
}

export const NotebookProvider: React.FC<NotebookProviderProps> = ({ children }) => {
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { data: notebooks, loading, error } = useData<Notebook[]>(
    () => notebookService.getNotebooks(),
    [refreshTrigger]
  );

  // Seleccionar el primer notebook por defecto cuando se cargan los datos
  useEffect(() => {
    if (notebooks && notebooks.length > 0 && !selectedNotebook) {
      setSelectedNotebook(notebooks[0]);
    }
  }, [notebooks, selectedNotebook]);

  const refetchNotebooks = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <NotebookContext.Provider
      value={{
        notebooks,
        selectedNotebook,
        setSelectedNotebook,
        loading,
        error,
        refetchNotebooks,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
};