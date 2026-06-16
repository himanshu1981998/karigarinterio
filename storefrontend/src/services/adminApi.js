import api from "@/lib/api"

export const fetchAdminDashboard = async () => {
  const res = await api.get("/admin/dashboard/")
  return res.data
}

export const fetchAdminCategories = async () => {
  const res = await api.get("/admin/categories/")
  return res.data
}

const buildCategoryPayload = (payload) => {
  if (!payload.image_file && !payload.clear_image) {
    return {
      data: {
        name: payload.name,
        is_active: payload.is_active,
      },
      config: undefined,
    }
  }

  const formData = new FormData()
  formData.append("name", payload.name)
  formData.append("is_active", payload.is_active ? "true" : "false")

  if (payload.image_file) {
    formData.append("image", payload.image_file)
  }

  if (payload.clear_image) {
    formData.append("clear_image", "true")
  }

  return {
    data: formData,
    config: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  }
}

export const createAdminCategory = async (payload) => {
  const { data, config } = buildCategoryPayload(payload)
  const res = await api.post("/admin/categories/", data, config)
  return res.data
}

export const updateAdminCategory = async (id, payload) => {
  const { data, config } = buildCategoryPayload(payload)
  const res = await api.patch(`/admin/categories/${id}/`, data, config)
  return res.data
}

export const deleteAdminCategory = async (id) => {
  const res = await api.delete(`/admin/categories/${id}/`)
  return res.data
}

export const fetchAdminProducts = async (params = {}) => {
  const res = await api.get("/admin/products/", { params })
  return res.data
}

export const createAdminProduct = async (payload) => {
  const res = await api.post("/admin/products/", payload)
  return res.data
}

export const updateAdminProduct = async (id, payload) => {
  const res = await api.patch(`/admin/products/${id}/`, payload)
  return res.data
}

export const deleteAdminProduct = async (id) => {
  const res = await api.delete(`/admin/products/${id}/`)
  return res.data
}

export const updateAdminProductStock = async (id, stock) => {
  const res = await api.patch(`/admin/products/${id}/stock/`, { stock })
  return res.data
}

export const updateAdminProductFeatured = async (id, isFeatured) => {
  const res = await api.patch(`/admin/products/${id}/feature/`, {
    is_featured: isFeatured,
  })
  return res.data
}

export const uploadAdminProductImages = async (id, files, payload = {}) => {
  const formData = new FormData()

  Array.from(files || []).forEach((file) => {
    formData.append("images", file)
  })

  formData.append("alt_text", payload.alt_text || "")
  formData.append("is_primary", payload.is_primary ?? true)

  const res = await api.post(`/admin/products/${id}/images/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return res.data
}

export const updateAdminProductImage = async (productId, imageId, payload) => {
  const res = await api.patch(`/admin/products/${productId}/images/${imageId}/`, payload)
  return res.data
}

export const deleteAdminProductImage = async (productId, imageId) => {
  const res = await api.delete(`/admin/products/${productId}/images/${imageId}/`)
  return res.data
}

export const fetchAdminOrders = async (params = {}) => {
  const res = await api.get("/admin/orders/", { params })
  return res.data
}

export const updateAdminOrderStatus = async (id, payload) => {
  const res = await api.patch(`/admin/orders/${id}/status/`, payload)
  return res.data
}

export const updateAdminOrderFulfillment = async (id, payload) => {
  const res = await api.patch(`/admin/orders/${id}/fulfillment/`, payload)
  return res.data
}

export const resolveAdminOrderCancellation = async (id, payload) => {
  const res = await api.patch(`/admin/orders/${id}/cancellation/`, payload)
  return res.data
}

export const resolveAdminOrderReturn = async (id, payload) => {
  const res = await api.patch(`/admin/orders/${id}/return/`, payload)
  return res.data
}

export const refundAdminOrder = async (id, payload = {}) => {
  const res = await api.post(`/admin/orders/${id}/refund/`, payload)
  return res.data
}

export const fetchAdminUsers = async (params = {}) => {
  const res = await api.get("/admin/users/", { params })
  return res.data
}

export const fetchAdminServices = async (params = {}) => {
  const res = await api.get("/admin/services/", { params })
  return res.data
}

export const updateAdminServiceStatus = async (id, payload) => {
  const res = await api.patch(`/admin/services/${id}/status/`, payload)
  return res.data
}

export const fetchAdminWebhookEvents = async () => {
  const res = await api.get("/admin/webhooks/razorpay/")
  return res.data
}

export const fetchAdminNotifications = async () => {
  const res = await api.get("/admin/notifications/")
  return res.data
}

export const getAdminExportUrl = (type) => {
  const baseURL = api.defaults.baseURL || ""
  return `${baseURL}/admin/export/${type}/`
}
