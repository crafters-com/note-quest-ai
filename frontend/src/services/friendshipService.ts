import api from './api';

export const friendshipService = {
  getFriends: () => api.get('/friendships/accepted/'),
  getPendingRequests: () => api.get('/friendships/pending_requests/'),
  sendRequest: (userId: string) => api.post('/friendships/', { receiver_id: userId.toString() }),
  acceptRequest: (requestId: string) => api.post(`/friendships/${requestId}/accept/`),
  rejectRequest: (requestId: string) => api.post(`/friendships/${requestId}/reject/`),
  removeFriend: (friendshipId: string) => api.delete(`/friendships/${friendshipId}/`),
  searchUsers: (query: string) => api.get(`/auth/search/?q=${query}`),
};

export default friendshipService;