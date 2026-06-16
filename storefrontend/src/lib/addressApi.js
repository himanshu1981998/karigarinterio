import api from "./api"

export const fetchAddresses = async () => {
  const res = await api.get("/addresses/")
  return res.data
}

export const createAddress = async (data) => {
  const res = await api.post("/addresses/", data)
  return res.data
}

export const updateAddress = async (id, data) => {
  const res = await api.patch(`/addresses/${id}/`, data)
  return res.data
}

export const deleteAddress = async (id) => {
  await api.delete(`/addresses/${id}/`)
}