import { create } from 'zustand';
import Cookies from 'js-cookie';

export const useAuthStore = create((set) => ({
  // Check if there is already a token when the app loads
  user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
  token: Cookies.get('token') || null,

  login: (user, token) => {
    Cookies.set('token', token, { expires: 1 }); // Expires in 1 day
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    set({ user, token });
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    set({ user: null, token: null });
  },
}));