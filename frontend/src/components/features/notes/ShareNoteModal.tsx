import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Users, Loader2, Share2, Folder } from 'lucide-react';
import { friendshipService } from "@/services/friendshipService";
import { notebookService } from "@/services/notebookService";
import { noteService } from "@/services/noteService";
import { useToast } from "@/hooks/useToast";

interface User {
  id: string;
  username: string;
  email: string;
}

interface FriendRequest {
  id: string;
  friend: User;
}

interface Notebook {
  id: number;
  name: string;
  subject: string;
}

interface ShareNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: number;
  noteTitle: string;
}

export const ShareNoteModal = ({ open, onOpenChange, noteId, noteTitle }: ShareNoteModalProps) => {
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [friendNotebooks, setFriendNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [step, setStep] = useState<'friend' | 'notebook'>('friend');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadFriends();
      setStep('friend');
      setSelectedFriend(null);
      setSelectedNotebook(null);
    }
  }, [open]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const response = await friendshipService.getFriends();
      setFriends(response.data);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus amigos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFriendSelect = async (friendId: string) => {
    setSelectedFriend(friendId);
    setStep('notebook');
    
    // Cargar notebooks del amigo (nota: necesitaremos un endpoint para esto)
    // Por ahora, permitiremos compartir sin seleccionar notebook específico
    setFriendNotebooks([]);
  };

  const handleShare = async () => {
    if (!selectedFriend) return;

    setSharing(true);
    try {
      await noteService.shareNote(noteId, selectedFriend, selectedNotebook || undefined);
      toast({
        title: "¡Nota compartida!",
        description: `La nota "${noteTitle}" ha sido compartida exitosamente`,
        variant: "success",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo compartir la nota",
        variant: "destructive"
      });
    } finally {
      setSharing(false);
    }
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Nota
          </DialogTitle>
          <DialogDescription>
            {step === 'friend' 
              ? 'Selecciona un amigo con quien compartir esta nota'
              : 'La nota se compartirá en el notebook "Notas Compartidas" de tu amigo'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tienes amigos agregados</p>
              <p className="text-sm text-muted-foreground">Agrega amigos para compartir notas</p>
            </div>
          ) : step === 'friend' ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {friends.map((friendship) => (
                <button
                  key={friendship.id}
                  onClick={() => handleFriendSelect(friendship.friend.id)}
                  className={`w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors text-left ${
                    selectedFriend === friendship.friend.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    {getInitials(friendship.friend.username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{friendship.friend.username}</p>
                    <p className="text-sm text-muted-foreground truncate">{friendship.friend.email}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    {getInitials(friends.find(f => f.friend.id === selectedFriend)?.friend.username || '')}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {friends.find(f => f.friend.id === selectedFriend)?.friend.username}
                    </p>
                    <p className="text-sm text-muted-foreground">Recibirá una copia editable de la nota</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Folder className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium">Notebook destino</p>
                  <p className="text-blue-700">
                    La nota se guardará automáticamente en el notebook del amigo. 
                    Podrá moverla o editarla como desee.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'notebook' && (
            <Button 
              variant="outline" 
              onClick={() => setStep('friend')}
              disabled={sharing}
            >
              Atrás
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sharing}>
            Cancelar
          </Button>
          {step === 'notebook' && (
            <Button 
              onClick={handleShare} 
              disabled={!selectedFriend || sharing}
              className="min-w-[100px]"
            >
              {sharing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Compartiendo...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
