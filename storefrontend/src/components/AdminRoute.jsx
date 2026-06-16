import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

const AdminRoute = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
