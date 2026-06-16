import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "boneyard-js/react"

import {
  Home,
  Building2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { useAuthModalStore } from "@/store/authModalStore"
import { useCheckoutStore } from "@/store/checkoutStore"
import { createOrder, createBuyNowOrder, verifyRazorpayPayment } from "@/lib/orderApi"
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/lib/addressApi"
import { toast } from "sonner"
import { AddressListSkeleton } from "@/components/skeletons/BoneyardSkeletons"

const emptyAddressForm = {
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

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    )

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        if (window.Razorpay) {
          resolve()
        } else {
          reject(new Error("Unable to load Razorpay Checkout"))
        }
        return
      }

      existingScript.addEventListener("load", resolve, { once: true })
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Razorpay Checkout")),
        { once: true }
      )
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => {
      script.dataset.loaded = "true"
      resolve()
    }
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout"))
    document.body.appendChild(script)
  })

const openRazorpayCheckout = (razorpayPayload) =>
  new Promise((resolve, reject) => {
    let settled = false

    const settleOnce = (callback, value) => {
      if (settled) return
      settled = true
      callback(value)
    }

    const razorpay = new window.Razorpay({
      key: razorpayPayload.key_id,
      amount: razorpayPayload.amount,
      currency: razorpayPayload.currency,
      name: razorpayPayload.name,
      description: razorpayPayload.description,
      order_id: razorpayPayload.order_id,
      prefill: razorpayPayload.prefill,
      notes: razorpayPayload.notes,
      theme: razorpayPayload.theme,
      handler: (response) => settleOnce(resolve, response),
      modal: {
        ondismiss: () => {
          const error = new Error("Payment was not completed")
          error.code = "PAYMENT_DISMISSED"
          settleOnce(reject, error)
        },
      },
    })

    razorpay.on("payment.failed", (response) => {
      const error = new Error(
        response?.error?.description || "Razorpay payment failed"
      )
      error.code = "PAYMENT_FAILED"
      error.response = response
      settleOnce(reject, error)
    })

    razorpay.open()
  })

const CheckoutPage = () => {
  const navigate = useNavigate()

  const cartItems = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.subtotal)
  const clearCart = useCartStore((state) => state.clearCart)

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const openLoginModal = useAuthModalStore((state) => state.openLoginModal)
  const setRedirectPath = useAuthModalStore((state) => state.setRedirectPath)

  const checkoutType = useCheckoutStore((state) => state.checkoutType)
  const buyNowItem = useCheckoutStore((state) => state.buyNowItem)
  const clearBuyNow = useCheckoutStore((state) => state.clearBuyNow)
  const switchToCartCheckout = useCheckoutStore((state) => state.useCartCheckout)

  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState("")

  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressSaving, setAddressSaving] = useState(false)
  const [addressForm, setAddressForm] = useState(emptyAddressForm)

  const [formData, setFormData] = useState({
    shipping_full_name: "",
    shipping_phone: "",
    shipping_address_line: "",
    shipping_landmark: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
    payment_method: "cod",
  })

  useEffect(() => {
    if (!isLoggedIn) {
      setRedirectPath("/checkout")
      openLoginModal()
      navigate("/")
    }
  }, [isLoggedIn, navigate, openLoginModal, setRedirectPath])

  const normalizedItems = useMemo(() => {
    if (checkoutType === "buy_now" && buyNowItem) {
      return [
        {
          id: buyNowItem.id,
          quantity: buyNowItem.quantity,
          name: buyNowItem.name,
          image: buyNowItem.image || "",
          line_total: Number(buyNowItem.price || 0) * buyNowItem.quantity,
        },
      ]
    }

    return cartItems.map((item) => {
      const product = item.product || item

      return {
        id: item.id,
        quantity: item.quantity,
        name: product?.name || "",
        image: product?.primary_image || product?.image || "",
        line_total: item.line_total
          ? Number(item.line_total)
          : Number(product?.price || 0) * item.quantity,
      }
    })
  }, [checkoutType, buyNowItem, cartItems])

  const totalPrice = useMemo(() => {
    if (checkoutType === "buy_now" && buyNowItem) {
      return Number(buyNowItem.price || 0) * buyNowItem.quantity
    }

    if (subtotal && Number(subtotal) > 0) {
      return Number(subtotal)
    }

    return normalizedItems.reduce((total, item) => total + item.line_total, 0)
  }, [checkoutType, buyNowItem, subtotal, normalizedItems])

  const applyAddressToCheckout = useCallback((address) => {
    setFormData((prev) => ({
      ...prev,
      shipping_full_name: address.full_name || "",
      shipping_phone: address.phone || "",
      shipping_address_line: address.address_line || "",
      shipping_city: address.city || "",
      shipping_state: address.state || "",
      shipping_pincode: address.pincode || "",
    }))
  }, [])

  const loadAddresses = useCallback(async () => {
    try {
      setAddressesLoading(true)
      const data = await fetchAddresses()
      setAddresses(data)

      const defaultAddress =
        data.find((addr) => addr.is_default) || data[0] || null

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
        applyAddressToCheckout(defaultAddress)
      } else {
        setSelectedAddressId(null)
      }
    } catch {
      toast.error("Failed to load addresses", {
        position: "bottom-center",
      })
    } finally {
      setAddressesLoading(false)
    }
  }, [applyAddressToCheckout])

  useEffect(() => {
    if (isLoggedIn) {
      loadAddresses()
    }
  }, [isLoggedIn, loadAddresses])

  const resetAddressModal = () => {
    setEditingAddressId(null)
    setAddressForm(emptyAddressForm)
    setShowAddressModal(false)
  }

  const openAddAddressModal = () => {
    setEditingAddressId(null)
    setAddressForm(emptyAddressForm)
    setShowAddressModal(true)
  }

  const openEditAddressModal = (address) => {
    setEditingAddressId(address.id)
    setAddressForm({
      label: address.label || "home",
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line: address.address_line || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      is_default: Boolean(address.is_default),
    })
    setShowAddressModal(true)
  }

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()

    try {
      setAddressSaving(true)

      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm)
        toast.success("Address updated", {
          position: "bottom-center",
        })
      } else {
        await createAddress(addressForm)
        toast.success("Address added", {
          position: "bottom-center",
        })
      }

      resetAddressModal()
      await loadAddresses()
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

      toast.error(message, {
        position: "bottom-center",
      })
    } finally {
      setAddressSaving(false)
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id)

      toast.success("Address deleted", {
        position: "bottom-center",
      })

      if (selectedAddressId === id) {
        setSelectedAddressId(null)
        setFormData((prev) => ({
          ...prev,
          shipping_full_name: "",
          shipping_phone: "",
          shipping_address_line: "",
          shipping_city: "",
          shipping_state: "",
          shipping_pincode: "",
        }))
      }

      await loadAddresses()
    } catch {
      toast.error("Failed to delete address", {
        position: "bottom-center",
      })
    }
  }

  const handlePaymentMethodChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      payment_method: e.target.value,
    }))
  }

  const placeOrderLabel = useMemo(() => {
    if (paymentStep === "opening") return "Opening Payment..."
    if (paymentStep === "verifying") return "Verifying Payment..."
    if (paymentStep === "placing") {
      return formData.payment_method === "online"
        ? "Starting Payment..."
        : "Placing Order..."
    }
    return formData.payment_method === "online" ? "Pay Securely" : "Place Order"
  }, [formData.payment_method, paymentStep])

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      setRedirectPath("/checkout")
      openLoginModal()
      return
    }

    if (normalizedItems.length === 0) {
      toast.error("No items selected for checkout", {
        position: "bottom-center",
      })
      return
    }

    if (
      !formData.shipping_full_name ||
      !formData.shipping_phone ||
      !formData.shipping_address_line ||
      !formData.shipping_city ||
      !formData.shipping_state ||
      !formData.shipping_pincode
    ) {
      toast.error("Please select or add a delivery address", {
        position: "bottom-center",
      })
      return
    }

    try {
      setLoading(true)
      setPaymentStep("placing")

      let data

      if (checkoutType === "buy_now" && buyNowItem) {
        data = await createBuyNowOrder({
          ...formData,
          product_id: buyNowItem.id,
          quantity: buyNowItem.quantity,
        })
      } else {
        data = await createOrder(formData)
      }

      if (formData.payment_method === "online") {
        if (!data.razorpay) {
          throw new Error("Payment gateway details were not returned")
        }

        setPaymentStep("opening")
        await loadRazorpayCheckout()
        const paymentResponse = await openRazorpayCheckout(data.razorpay)

        setPaymentStep("verifying")
        data = await verifyRazorpayPayment({
          order_number: data.order.order_number,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        })
      }

      if (checkoutType === "buy_now" && buyNowItem) {
        clearBuyNow()
        switchToCartCheckout()
      } else {
        await clearCart()
      }

      toast.success(
        formData.payment_method === "online"
          ? "Payment successful"
          : "Order placed successfully",
        {
          description: `Order ${data.order.order_number}`,
          position: "bottom-center",
        }
      )

      navigate("/orders")
    } catch (error) {
      const data = error?.response?.data || {}

      const message =
        error?.code === "PAYMENT_DISMISSED"
          ? "Payment was not completed. Your cart is still available."
          : error?.code === "PAYMENT_FAILED"
            ? error.message
            : error?.message === "Payment gateway details were not returned"
              ? error.message
              : data?.detail ||
                data?.non_field_errors?.[0] ||
                data?.product_id?.[0] ||
                data?.quantity?.[0] ||
                "Checkout failed"

      toast.error(message, {
        position: "bottom-center",
      })
    } finally {
      setLoading(false)
      setPaymentStep("")
    }
  }

  return (
    <>
    <Skeleton name="checkout-page" loading={loading}>
      <div className="min-h-screen bg-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
            <div className="order-2 space-y-6 lg:order-1">
              {/* Address Section */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Delivery Address
                  </h2>

                  <Button
                    size="sm"
                    onClick={openAddAddressModal}
                    className="rounded-full bg-[#8B5E3C] text-white hover:bg-[#7A5234]"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {addressesLoading ? (
                  <Skeleton
                    name="checkout-address-list"
                    loading={addressesLoading}
                    fallback={<AddressListSkeleton />}
                    fixture={<AddressListSkeleton />}
                  >
                    <AddressListSkeleton />
                  </Skeleton>
                ) : addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-zinc-500">
                    <MapPin className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
                    No address found

                    <Button
                      variant="outline"
                      className="mt-4 rounded-xl border-dashed"
                      onClick={openAddAddressModal}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => {
                      const Icon =
                        labelOptions.find((l) => l.value === address.label)
                          ?.icon || MapPin

                      return (
                        <label
                          key={address.id}
                          className={`block cursor-pointer rounded-xl border p-4 transition ${
                            selectedAddressId === address.id
                              ? "border-black bg-zinc-50"
                              : "border-zinc-200"
                          }`}
                        >
                          <div className="flex justify-between">
                            <div className="flex gap-3">
                              <input
                                type="radio"
                                name="checkout_address"
                                checked={selectedAddressId === address.id}
                                onChange={() => {
                                  setSelectedAddressId(address.id)
                                  applyAddressToCheckout(address)
                                }}
                                className="mt-1"
                              />

                              <Icon className="mt-1 h-5 w-5 text-zinc-600" />

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-zinc-900">
                                    {address.full_name}
                                  </p>

                                  {address.is_default && (
                                    <span className="rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                      Default
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-zinc-600">
                                  {address.address_line}, {address.city},{" "}
                                  {address.state} - {address.pincode}
                                </p>

                                <p className="text-xs text-zinc-500">
                                  {address.phone}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openEditAddressModal(address)
                                }}
                                className="rounded-lg p-2 hover:bg-zinc-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleDeleteAddress(address.id)
                                }}
                                className="rounded-lg p-2 hover:bg-zinc-100"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Payment Section */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      formData.payment_method === "cod"
                        ? "border-black bg-zinc-50"
                        : "border-zinc-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === "cod"}
                      onChange={handlePaymentMethodChange}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Cash on Delivery
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Pay when your order is delivered.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      formData.payment_method === "online"
                        ? "border-black bg-zinc-50"
                        : "border-zinc-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="online"
                      checked={formData.payment_method === "online"}
                      onChange={handlePaymentMethodChange}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Online Payment (Razorpay)
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Pay securely using UPI, cards, wallets, or netbanking.
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Order Summary */}
            <aside className="order-1 h-fit rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 lg:order-2 lg:sticky lg:top-24">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Order Summary
                </h2>

                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                  {checkoutType === "buy_now" ? "Buy Now" : "Cart Checkout"}
                </span>
              </div>

              {normalizedItems.length === 0 ? (
                <p className="text-sm text-zinc-500">No items selected.</p>
              ) : (
                <div className="space-y-4">
                  {normalizedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-zinc-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-zinc-900">
                        ₹{item.line_total.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-base font-semibold text-zinc-900">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || normalizedItems.length === 0}
                  className="mt-6 h-11 w-full rounded-full bg-[#8B5E3C] text-white hover:bg-[#7A5234]"
                >
                  {placeOrderLabel}
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddressId ? "Edit Address" : "Add Address"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {labelOptions.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() =>
                      setAddressForm((prev) => ({
                        ...prev,
                        label: opt.value,
                      }))
                    }
                    className={`rounded-xl border p-2 text-sm ${
                      addressForm.label === opt.value
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

            <Input
              name="full_name"
              placeholder="Full Name"
              required
              value={addressForm.full_name}
              onChange={handleAddressFormChange}
            />

            <Input
              name="phone"
              placeholder="Phone"
              required
              maxLength={10}
              value={addressForm.phone}
              onChange={(e) =>
                setAddressForm((prev) => ({
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
              value={addressForm.pincode}
              onChange={(e) =>
                setAddressForm((prev) => ({
                  ...prev,
                  pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                }))
              }
            />

            <Input
              name="address_line"
              placeholder="Address"
              required
              value={addressForm.address_line}
              onChange={handleAddressFormChange}
            />

            <Input
              name="city"
              placeholder="City"
              required
              value={addressForm.city}
              onChange={handleAddressFormChange}
            />

            <Input
              name="state"
              placeholder="State"
              required
              value={addressForm.state}
              onChange={handleAddressFormChange}
            />

            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                name="is_default"
                checked={addressForm.is_default}
                onChange={handleAddressFormChange}
              />
              Set as default address
            </label>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetAddressModal}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={addressSaving}
                className="bg-[#8B5E3C] text-white hover:bg-[#7A5234]"
              >
                {addressSaving
                  ? editingAddressId
                    ? "Updating..."
                    : "Saving..."
                  : editingAddressId
                    ? "Update Address"
                    : "Save Address"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
       </Skeleton>
    </>
   
  )
}

export default CheckoutPage
