import api from './api';

export const friendshipService = {
  getFriends: () => api.get('/friendships/accepted/'),
  getPendingRequests: () => api.get('/friendships/pending_requests/'),
  sendRequest: async (userId: string) => {
    console.log('Enviando solicitud de amistad a:', userId);
    // Asegurarse de que el userId es una cadena
    const data = { receiver_id: userId.toString() };
    console.log('Datos a enviar:', data);
    return api.post('/friendships/', data);
  },
  acceptRequest: (requestId: string) => api.post(`/friendships/${requestId}/accept/`),
  rejectRequest: (requestId: string) => api.post(`/friendships/${requestId}/reject/`),
  removeFriend: (friendshipId: string) => api.delete(`/friendships/${friendshipId}/`),
  searchUsers: (query: string) => api.get(`/auth/search/?q=${query}`),
};

export default friendshipService;