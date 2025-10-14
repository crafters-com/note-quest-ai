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
          description: "Error searching users",
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
        title: "Success",
        description: "Friend request sent",
        variant: "success",
      });
      setSearchQuery('');
      setSearchResults([]);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Could not send friend request",
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
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Add Friends</DialogTitle>
          <DialogDescription>
            Search users by name or email to send friend requests.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <Input
              placeholder="Search users..."
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
                  <li key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
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
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            ) : searchQuery ? (
              <p className="text-center text-gray-500 py-8">No users found</p>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};