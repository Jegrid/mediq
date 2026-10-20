import { create } from "zustand";

//save the user with the token so the role is kept on refresh
function loadUser() {
  try {
    return JSON.parse(localStorage.getItem("mediq_user"));
  } catch {
    return null;
  }
}

export const useAuthStore = create((set) => ({
  user: loadUser(),
  token: localStorage.getItem("mediq_token") || null,

  setAuth: (user, token) => {
    localStorage.setItem("mediq_token", token);
    localStorage.setItem("mediq_user", JSON.stringify(user));
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem("mediq_token");
    localStorage.removeItem("mediq_user");
    set({ user: null, token: null });
  },
}));
