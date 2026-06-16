import api from "./api"

export const createServiceEnquiry = async (payload) => {
  const response = await api.post("/service-enquiries/", payload)
  return response.data
}