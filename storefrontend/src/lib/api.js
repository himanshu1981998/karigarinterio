import axios from "axios"

const baseURL=  import.meta.env.VITE_BACKEND_BASE_API
const api = axios.create({
  baseURL: baseURL
})

const refreshClient = axios.create({
  baseURL: baseURL
})

api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access")

  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      const refresh = localStorage.getItem("refresh")

      if (!refresh) {
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")
        localStorage.removeItem("auth-storage")
        window.location.reload()
        return Promise.reject(error)
      }

      try {
        const response = await refreshClient.post("/auth/token/refresh/", {
          refresh,
        })

        const newAccess = response.data.access
        localStorage.setItem("access", newAccess)

        if (response.data.refresh) {
          localStorage.setItem("refresh", response.data.refresh)
        }

        originalRequest.headers.Authorization = `Bearer ${newAccess}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")
        localStorage.removeItem("auth-storage")
        window.location.reload()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api