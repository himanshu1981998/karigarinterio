import api from "./api"

// GET CART
export const fetchCart = async () => {
  const res = await api.get("/cart/")
  return res.data
}

// ADD ITEM
export const addCartItem = async (productId, quantity = 1) => {
  const res = await api.post("/cart/add/", {
    product_id: productId,
    quantity,
  })
  return res.data
}

// UPDATE ITEM
export const updateCartItem = async (itemId, quantity) => {
  const res = await api.patch(`/cart/items/${itemId}/`, {
    quantity,
  })
  return res.data
}

// REMOVE ITEM
export const removeCartItem = async (itemId) => {
  const res = await api.delete(`/cart/items/${itemId}/remove/`)
  return res.data
}

// CLEAR CART
export const clearCart = async () => {
  const res = await api.delete("/cart/clear/")
  return res.data
}