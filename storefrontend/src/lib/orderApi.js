import api from "./api"

export const createOrder = async (payload) => {
  const res = await api.post("/checkout/", payload)
  return res.data
}


export const createBuyNowOrder = async (payload) => {
  const res = await api.post("/checkout/buy-now/", payload)
  return res.data
}

export const verifyRazorpayPayment = async (payload) => {
  const res = await api.post("/payments/razorpay/verify/", payload)
  return res.data
}

export const requestOrderCancellation = async (orderNumber, reason) => {
  const res = await api.post(`/orders/${orderNumber}/cancel-request/`, { reason })
  return res.data
}

export const requestOrderReturn = async (orderNumber, reason) => {
  const res = await api.post(`/orders/${orderNumber}/return-request/`, { reason })
  return res.data
}
