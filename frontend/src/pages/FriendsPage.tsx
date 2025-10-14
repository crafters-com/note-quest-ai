import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserPlus, UserMinus, UserCheck, UserX } from 'lucide-react';
import { friendshipService } from '@/services/friendshipService';
import { SearchFriendsModal } from '@/components/features/friends/SearchFriendsModal';
import { useToast } from "@/hooks/useToast";

interface User {
  id: string;
  username: string;
  email: string;
}

interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  friend: User;
  status: 'pending' | 'accepted' | 'rejected';
}

const FriendsPage = () => {
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await friendshipService.getFriends();
      setFriends(response.data);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los amigos",
        variant: "destructive"
      });
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await friendshipService.getPendingRequests();
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes pendientes",
        variant: "destructive"
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendshipService.acceptRequest(requestId);
      toast({
        title: "Éxito",
        description: "Solicitud de amistad aceptada",
      });
      loadFriends();
      loadPendingRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "No se pudo aceptar la solicitud",
        variant: "destructive"
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendshipService.rejectRequest(requestId);
      toast({
        title: "Éxito",
        description: "Solicitud de amistad rechazada",
      });
      loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await friendshipService.removeFriend(friendshipId);
      toast({
        title: "Éxito",
        description: "Amigo eliminado",
      });
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar al amigo",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Amigos</h1>
        
        {/* Botón para abrir el modal de búsqueda */}
        <div className="flex justify-end">
          <Button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Buscar Amigos
          </Button>
        </div>

        <SearchFriendsModal
          open={isSearchModalOpen}
          onOpenChange={setIsSearchModalOpen}
          onSuccess={loadFriends}
        />

        {/* Solicitudes pendientes */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Solicitudes Pendientes</h2>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground">No hay solicitudes pendientes</p>
            ) : (
              <ul className="space-y-2">
                {pendingRequests.map((request) => (
                  <li key={request.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{request.sender.username}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Aceptar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Lista de amigos */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Mis Amigos</h2>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <p className="text-muted-foreground">Aún no tienes amigos agregados</p>
            ) : (
              <ul className="space-y-2">
                {friends.map((friendship) => (
                  <li key={friendship.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{friendship.friend.username}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFriend(friendship.id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FriendsPage;