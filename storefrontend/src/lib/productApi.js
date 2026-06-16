import api from "./api"

const buildProductQueryParams = (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.category) params.set("category", filters.category)
  if (filters.search) params.set("search", filters.search.trim())

  if (filters.minPrice !== "" && filters.minPrice !== undefined && filters.minPrice !== null) {
    params.set("min_price", String(filters.minPrice))
  }

  if (filters.maxPrice !== "" && filters.maxPrice !== undefined && filters.maxPrice !== null) {
    params.set("max_price", String(filters.maxPrice))
  }

  if (filters.sort) params.set("sort", filters.sort)
  if (filters.featured) params.set("featured", "true")
  if (filters.sale) params.set("sale", "true")

  // pagination
  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("page_size", String(filters.pageSize))

  return params
}

/**
 * Normalize backend / network errors into one readable message.
 */
const getApiErrorMessage = (error, fallbackMessage = "Something went wrong") => {
  const data = error?.response?.data

  if (typeof data === "string") return data
  if (data?.detail) return data.detail
  if (data?.message) return data.message

  // first field error if backend returns validation object
  if (data && typeof data === "object") {
    const firstKey = Object.keys(data)[0]
    const firstValue = data[firstKey]

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return firstValue[0]
    }

    if (typeof firstValue === "string") {
      return firstValue
    }
  }

  if (error?.message) return error.message

  return fallbackMessage
}

/**
 * Fetch product list.
 * Supports filters + pagination + request cancellation.
 */
export const fetchProducts = async (filters = {}, options = {}) => {
  try {
    const params = buildProductQueryParams(filters)

    const response = await api.get("/products/", {
      params,
      signal: options.signal,
    })

    return response.data
  } catch (error) {
    // ignore cancelled request errors if caller wants to handle them
    if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
      throw error
    }

    throw new Error(getApiErrorMessage(error, "Failed to fetch products"))
  }
}

/**
 * Fetch all categories.
 */
export const fetchCategories = async (options = {}) => {
  try {
    const response = await api.get("categories/", {
      signal: options.signal,
    })

    return response.data
  } catch (error) {
    if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
      throw error
    }

    throw new Error(getApiErrorMessage(error, "Failed to fetch categories"))
  }
}

/**
 * Fetch a single product by slug.
 */
export const fetchProductDetail = async (slug, options = {}) => {
  try {
    if (!slug) {
      throw new Error("Product slug is required")
    }

    const response = await api.get(`/products/${slug}/`, {
      signal: options.signal,
    })

    return response.data
  } catch (error) {
    if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
      throw error
    }

    throw new Error(getApiErrorMessage(error, "Failed to fetch product details"))
  }
}
