import { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useAuthModalStore } from "@/store/authModalStore"

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const openLoginModal = useAuthModalStore((state) => state.openLoginModal)
  const location = useLocation()

  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal(location.pathname)
    }
  }, [isLoggedIn, openLoginModal, location.pathname])

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute