import { create } from "zustand"

type AuthStore = {
  isAdmin: boolean
  setAdmin: (val: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAdmin: false,
  setAdmin: (val) => set({ isAdmin: val }),
}))
