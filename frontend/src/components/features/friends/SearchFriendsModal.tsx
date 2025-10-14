import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { UserPlus, Loader2 } from 'lucide-react';
import { friendshipService } from "@/services/friendshipService";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";

interface User {
  id: string;
  username: string;
  email: string;
}

interface SearchFriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void; // Para recargar la lista de amigos después de enviar una solicitud
}

export const SearchFriendsModal = ({ open, onOpenChange, onSuccess }: SearchFriendsModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 500);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setLoading(true);
      try {
        const response = await friendshipService.searchUsers(query);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
        toast({
          title: "Error",
          description: "Error al buscar usuarios",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    setSending(true);
    try {
      await friendshipService.sendRequest(userId);
      toast({
        title: "Éxito",
        description: "Solicitud de amistad enviada",
        variant: "success",
      });
      setSearchQuery('');
      setSearchResults([]);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo enviar la solicitud de amistad",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Effect para ejecutar búsqueda con debounce
  useEffect(() => {
    handleSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Amigos</DialogTitle>
          <DialogDescription>
            Busca usuarios por nombre o correo electrónico para enviar solicitudes de amistad.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <Input
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="space-y-2">
                {searchResults.map((user) => (
                  <li key={user.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendFriendRequest(user.id)}
                      disabled={sending}
                      className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Añadir
                    </Button>
                  </li>
                ))}
              </ul>
            ) : searchQuery ? (
              <p className="text-center text-muted-foreground">No se encontraron usuarios</p>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};