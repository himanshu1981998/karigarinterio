import { useEffect, useState } from "react"
import { Home, Building2, MapPin, Pencil, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/lib/addressApi"
import { toast } from "sonner"

const emptyForm = {
  label: "home",
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
}

const labelOptions = [
  { value: "home", label: "Home", icon: Home },
  { value: "office", label: "Office", icon: Building2 },
  { value: "other", label: "Other", icon: MapPin },
]

const ShippingAddresses = ({ selectedAddressId, onSelect }) => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState(emptyForm)

  // ---------------- LOAD ----------------
  const loadAddresses = async () => {
    try {
      const data = await fetchAddresses()
      setAddresses(data)
    } catch {
      toast.error("Failed to load addresses", {
        position: "bottom-center",
      })
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  // ---------------- FORM ----------------
  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setShowModal(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleAddClick = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const handleEditClick = (address) => {
    setEditingId(address.id)
    setFormData({
      label: address.label || "home",
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line: address.address_line || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      is_default: Boolean(address.is_default),
    })
    setShowModal(true)
  }

  // ---------------- DELETE ----------------
  const handleDeleteClick = async (id) => {
    try {
      await deleteAddress(id)
      toast.success("Address deleted", { position: "bottom-center" })
      loadAddresses()
    } catch {
      toast.error("Failed to delete address", {
        position: "bottom-center",
      })
    }
  }

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      if (editingId) {
        await updateAddress(editingId, formData)
        toast.success("Address updated", { position: "bottom-center" })
      } else {
        await createAddress(formData)
        toast.success("Address added", { position: "bottom-center" })
      }

      resetForm()
      loadAddresses()
    } catch (error) {
      const data = error?.response?.data || {}

      const message =
        data?.label?.[0] ||
        data?.full_name?.[0] ||
        data?.phone?.[0] ||
        data?.address_line?.[0] ||
        data?.city?.[0] ||
        data?.state?.[0] ||
        data?.pincode?.[0] ||
        data?.detail ||
        "Something went wrong"

      toast.error(message, { position: "bottom-center" })
    } finally {
      setLoading(false)
    }
  }

  // ---------------- UI ----------------
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900">
          Delivery Address
        </h2>

        <Button
          size="sm"
          onClick={handleAddClick}
          className="rounded-full bg-[#8B5E3C] text-white hover:bg-[#7A5234]"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Empty */}
      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-zinc-500">
          No address found
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const Icon =
              labelOptions.find((l) => l.value === address.label)?.icon ||
              MapPin

            return (
              <div
                key={address.id}
                onClick={() => onSelect?.(address.id)}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  selectedAddressId === address.id
                    ? "border-black bg-zinc-50"
                    : "border-zinc-200"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-zinc-600" />

                    <div className="min-w-0 flex-1">
                      {/* Name + Default badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-zinc-900">
                          {address.full_name}
                        </p>

                        {address.is_default && (
                          <span className="rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="break-words text-sm leading-6 text-zinc-600">
                        {address.address_line}, {address.city},{" "}
                        {address.state} - {address.pincode}
                      </p>

                      <p className="text-xs text-zinc-500">
                        {address.phone}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 justify-end gap-1 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(address)
                      }}
                      className="rounded-lg p-2 hover:bg-zinc-100"
                      aria-label="Edit address"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(address.id)
                      }}
                      className="rounded-lg p-2 hover:bg-zinc-100"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-zinc-900">
                {editingId ? "Edit Address" : "Add Address"}
              </h3>

              <button type="button" onClick={resetForm} aria-label="Close address form">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label */}
              <div className="grid grid-cols-3 gap-2">
                {labelOptions.map((opt) => {
                  const Icon = opt.icon
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          label: opt.value,
                        }))
                      }
                      className={`rounded-xl border p-2 text-sm ${
                        formData.label === opt.value
                          ? "border-black bg-zinc-100"
                          : "border-zinc-200"
                      }`}
                    >
                      <Icon className="mx-auto mb-1 h-4 w-4" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {/* Inputs */}
              <Input
                name="full_name"
                placeholder="Full Name"
                required
                value={formData.full_name}
                onChange={handleChange}
              />

              <Input
                name="phone"
                placeholder="Phone"
                required
                maxLength={10}
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
              />

              <Input
                name="pincode"
                placeholder="Pincode"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
              />

              <Input
                name="address_line"
                placeholder="Address"
                required
                value={formData.address_line}
                onChange={handleChange}
              />

              <Input
                name="city"
                placeholder="City"
                required
                value={formData.city}
                onChange={handleChange}
              />

              <Input
                name="state"
                placeholder="State"
                required
                value={formData.state}
                onChange={handleChange}
              />

              {/* Default checkbox */}
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                />
                Set as default address
              </label>

              <div className="grid gap-3 sm:flex sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="rounded-xl sm:min-w-28"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#8B5E3C] text-white sm:min-w-36"
                >
                  {loading ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default ShippingAddresses
