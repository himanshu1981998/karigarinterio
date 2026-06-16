import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoggedIn: false,
      isAdmin: false,
      isStaff: false,
      isSuperuser: false,

      logIn: (user) => {
        const isStaff = Boolean(user?.is_staff)
        const isSuperuser = Boolean(user?.is_superuser)

        set({
          user,
          isLoggedIn: true,
          isStaff,
          isSuperuser,
          isAdmin: isStaff || isSuperuser,
        })
      },

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
          isAdmin: false,
          isStaff: false,
          isSuperuser: false,
        })
      },
    }),
    {
      name: "auth-storage",
      version: 1,
      migrate: (persistedState) => {
        const user = persistedState?.user
        const isStaff = Boolean(user?.is_staff)
        const isSuperuser = Boolean(user?.is_superuser)

        return {
          ...persistedState,
          isStaff,
          isSuperuser,
          isAdmin: isStaff || isSuperuser,
        }
      },
    }
  )
)
