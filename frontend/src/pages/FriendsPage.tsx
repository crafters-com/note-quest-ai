import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserPlus, UserMinus, UserCheck, UserX, Users, Clock, Search } from 'lucide-react';
import { friendshipService } from '@/services/friendshipService';
import { SearchFriendsModal } from '@/components/features/friends/SearchFriendsModal';
import { useToast } from "@/hooks/useToast";
import { Input } from "@/components/ui/Input";

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
  const [searchTerm, setSearchTerm] = useState("");
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
        description: "Could not load friends",
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
        description: "Could not load pending requests",
        variant: "destructive"
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendshipService.acceptRequest(requestId);
      toast({
        title: "Success",
        description: "Friend request accepted",
        variant: "success",
      });
      await loadFriends();
      await loadPendingRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Could not accept the request",
        variant: "destructive"
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendshipService.rejectRequest(requestId);
      toast({
        title: "Success",
        description: "Friend request rejected",
        variant: "success",
      });
      loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: "Error",
        description: "Could not reject the request",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await friendshipService.removeFriend(friendshipId);
      toast({
        title: "Success",
        description: "Friend removed",
        variant: "success",
      });
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "Could not remove the friend",
        variant: "destructive"
      });
    }
  };

  // Función para obtener iniciales del nombre de usuario
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  // Filtrar amigos por búsqueda
  const filteredFriends = friends.filter((friendship) =>
    friendship.friend.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friendship.friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Friends</h1>
          <p className="text-muted-foreground">
            Connect and collaborate with other users
          </p>
        </div>
        <Button className="w-fit" onClick={() => setIsSearchModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Friends
        </Button>
      </div>

      <SearchFriendsModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
        onSuccess={loadFriends}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{friends.length}</p>
              <p className="text-sm text-muted-foreground">Friends</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{friends.length + pendingRequests.length}</p>
              <p className="text-sm text-muted-foreground">Total Connections</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes Pendientes */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Requests
              </h2>
              <span className="text-sm text-muted-foreground">
                {pendingRequests.length} {pendingRequests.length === 1 ? 'request' : 'requests'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {getInitials(request.sender.username)}
                    </div>
                    <div>
                      <p className="font-semibold">{request.sender.username}</p>
                      <p className="text-sm text-muted-foreground">{request.sender.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectRequest(request.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Amigos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              My Friends
            </h2>
            {friends.length > 0 && (
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">You don't have friends yet</h3>
              <p className="text-muted-foreground mb-4">
                Start connecting with other users to collaborate
              </p>
              <Button onClick={() => setIsSearchModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Friends
              </Button>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No friends found with that name</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFriends.map((friendship) => (
                <div 
                  key={friendship.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                      {getInitials(friendship.friend.username)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{friendship.friend.username}</p>
                      <p className="text-sm text-muted-foreground truncate">{friendship.friend.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFriend(friendship.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 border-transparent"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendsPage;