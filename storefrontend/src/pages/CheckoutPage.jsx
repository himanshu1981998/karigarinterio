import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cartStore"
import { useOrderStore } from "@/store/orderStore"
import { toast } from "sonner"

const CheckoutPage = () => {
  const navigate = useNavigate()

  const cartItems = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  const totalPrice = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  )

  const placeOrder = useOrderStore((state) => state.placeOrder)

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      toast.error("Your cart is empty", {
        position: "bottom-center",
      })
      return
    }

    const newOrder = placeOrder(formData, cartItems, totalPrice)

    clearCart()

    toast.success("Order placed successfully", {
      description: `Order ${newOrder.orderNumber} created`,
      position: "bottom-center",
    })

    navigate("/orders")
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          {/* Checkout form */}
          <form
            id="checkout-form"
            onSubmit={handlePlaceOrder}
            className="order-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 lg:order-1"
          >
            <h1 className="mb-5 text-xl font-bold text-zinc-900 sm:mb-6 sm:text-2xl">
             Address
            </h1>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <Input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                required
              />
              <Input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-4 space-y-4">
              <Input
                name="address"
                placeholder="Full Address"
                value={formData.address}
                onChange={handleChange}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <h2 className="mb-3 text-xl font-semibold text-zinc-900">
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                  />
                  <span className="text-sm text-zinc-700">Cash on Delivery</span>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === "online"}
                    onChange={handleChange}
                  />
                  <span className="text-sm text-zinc-700">Online Payment</span>
                </label>
              </div>
            </div>
          </form>

          {/* Order summary */}
          <div className="order-1 h-fit rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 lg:order-2 lg:sticky lg:top-24">
            <h2 className="mb-4 text-lg  text-zinc-900">
              Order Summary
            </h2>

            {cartItems.length === 0 ? (
              <p className="text-sm text-zinc-500">No items in cart.</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
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
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between text-base font-semibold text-zinc-900">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="mt-6 h-11 w-full rounded-full bg-[#8B5E3C] text-white hover:bg-[#7A5234]"
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage