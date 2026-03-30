import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
import api from "@/lib/api"
import ShippingAddresses from "./ShippingAddresses"

const MyProfile = () => {
  const profile = useAuthStore((state) => state.profile)
  const user = useAuthStore((state) => state.user)
  const setProfile = useAuthStore((state) => state.setProfile)

  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    email: profile?.email || "",
    contact_number: profile?.contact_number || user?.phone || "",
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFormData({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      email: profile?.email || "",
      contact_number: profile?.contact_number || user?.phone || "",
    })
  }, [profile, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const response = await api.patch("/profile/", formData)

      setProfile(response.data)

      toast.success("Profile updated", {
        description: "Your profile has been saved successfully.",
        position: "bottom-center",
      })
    } catch (error) {
      console.error("Profile update error:", error)

      const data = error?.response?.data
      const message =
        data?.detail ||
        data?.first_name?.[0] ||
        data?.last_name?.[0] ||
        data?.email?.[0] ||
        data?.contact_number?.[0] ||
        "Failed to update profile"

      toast.error("Error", {
        description: message,
        position: "bottom-center",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-zinc-900">My Profile</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Manage your personal information and contact details.
              </p>
            </div>

            <form onSubmit={handleSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    First Name
                  </label>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Last Name
                  </label>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Contact Number
                  </label>
                  <Input
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#8B5E3C] text-white hover:bg-[#7A5234] disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </section>

          <ShippingAddresses />
        </div>
      </div>
    </div>
  )
}

export default MyProfile