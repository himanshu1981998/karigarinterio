import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoggedIn: false,

      logIn: (user) =>
        set({
          user,
          isLoggedIn: true,
        }),

      setProfile: (profile) =>
        set({
          profile,
        }),

      logOut: () => {
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")

        set({
          user: null,
          profile: null,
          isLoggedIn: false,
        })
      },
    }),
    {
      name: "auth-storage",
    }
  )
)