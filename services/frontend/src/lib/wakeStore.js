import { create } from "zustand";

//counts requests that have been waiting long enough to show the wake up notice
export const useWakeStore = create((set) => ({
  slowRequests: 0,
  addSlow: () => set((state) => ({ slowRequests: state.slowRequests + 1 })),
  removeSlow: () =>
    set((state) => ({ slowRequests: Math.max(0, state.slowRequests - 1) })),
}));
