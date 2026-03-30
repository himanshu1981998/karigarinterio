import { create } from "zustand"

export const useAuthModalStore = create((set) => ({
  isLoginOpen: false,
  redirectPath: null,

  openLoginModal: (path = null) =>
    set({
      isLoginOpen: true,
      redirectPath: path,
    }),

  closeLoginModal: () =>
    set({
      isLoginOpen: false,
    }),

  clearRedirectPath: () =>
    set({
      redirectPath: null,
    }),
}))