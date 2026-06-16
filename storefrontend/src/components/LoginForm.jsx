import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { useAuthModalStore } from "@/store/authModalStore"
import { useCartStore } from "@/store/cartStore"

export function LoginForm() {
  const [phone, setPhone] = useState("")
  const [step, setStep] = useState("phone")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  })

  const inputRefs = useRef([])
  const navigate = useNavigate()

  const logIn = useAuthStore((state) => state.logIn)
  const setProfile = useAuthStore((state) => state.setProfile)

  const closeLoginModal = useAuthModalStore((state) => state.closeLoginModal)
  const redirectPath = useAuthModalStore((state) => state.redirectPath)
  const clearRedirectPath = useAuthModalStore((state) => state.clearRedirectPath)

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()

    if (phone.length !== 10) {
      toast.error("Invalid number", {
        description: "Please enter a valid 10-digit mobile number",
        position: "bottom-center",
      })
      return
    }

    try {
      setLoading(true)

      const response = await api.post("/auth/send-otp/", {
        phone,
      })

      toast.success("OTP sent successfully", {
        description: `OTP sent to ${response.data.phone}`,
        position: "bottom-center",
      })

      setStep("otp")
      setResendTimer(30)
    } catch (error) {
      const data = error?.response?.data
      const message =
        data?.phone?.[0] ||
        data?.detail ||
        data?.non_field_errors?.[0] ||
        "Failed to send OTP"

      toast.error("Error", {
        description: message,
        position: "bottom-center",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return

    const updatedOtp = [...otp]
    updatedOtp[index] = value
    setOtp(updatedOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").trim()

    if (/^\d{6}$/.test(paste)) {
      const digits = paste.split("")
      setOtp(digits)
      inputRefs.current[5]?.focus()
    }
  }

  const verifyOtp = async () => {
    const finalOtp = otp.join("")

    if (finalOtp.length !== 6) {
      toast.error("Invalid OTP", {
        description: "Please enter all 6 digits",
        position: "bottom-center",
      })
      return
    }

    try {
      setLoading(true)

      const response = await api.post("/auth/verify-otp/", {
        phone,
        code: finalOtp,
      })

      const { user, tokens, is_new_user } = response.data
      const authenticatedUser = {
        ...user,
        is_staff: Boolean(user?.is_staff),
        is_superuser: Boolean(user?.is_superuser),
      }

      localStorage.setItem("access", tokens.access)
      localStorage.setItem("refresh", tokens.refresh)
        console.log(authenticatedUser)
      logIn(authenticatedUser)

      await useCartStore.getState().syncGuestCart()

      if (is_new_user) {
        toast.success("Phone verified", {
          description: "Complete your profile to continue",
          position: "bottom-center",
        })
        setStep("profile")
        return
      }

      const profileResponse = await api.get("/profile/")
      setProfile(profileResponse.data)

      toast.success("Login successful", {
        description: "You are now logged in",
        position: "bottom-center",
      })

      closeLoginModal()

      setTimeout(() => {
        if (redirectPath) {
          navigate(redirectPath)
          clearRedirectPath()
        } else {
          navigate("/")
        }
      }, 800)
    } catch (error) {
      console.error("Verify OTP error:", error)

      const data = error?.response?.data
      const message =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        data?.phone?.[0] ||
        data?.code?.[0] ||
        (typeof data === "string" ? data : null) ||
        error?.message ||
        "OTP verification failed"

      toast.error("Error", {
        description: message,
        position: "bottom-center",
      })

      if (
        typeof message === "string" &&
        (message.includes("blocked") ||
          message.includes("expired") ||
          message.includes("resend"))
      ) {
        setOtp(["", "", "", "", "", ""])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (loading || resendTimer > 0) return

    try {
      setLoading(true)

      const response = await api.post("/auth/send-otp/", {
        phone,
      })

      toast.success("OTP resent", {
        description: `New OTP sent to ${response.data.phone}`,
        position: "bottom-center",
      })

      setOtp(["", "", "", "", "", ""])
      setResendTimer(30)
      inputRefs.current[0]?.focus()
    } catch (error) {
      const data = error?.response?.data
      const message =
        data?.phone?.[0] ||
        data?.detail ||
        data?.non_field_errors?.[0] ||
        "Failed to resend OTP"

      toast.error("Error", {
        description: message,
        position: "bottom-center",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const response = await api.patch("/profile/", {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
        contact_number: phone,
      })

      setProfile(response.data)

      toast.success("Profile completed", {
        description: "Your account is ready",
        position: "bottom-center",
      })

      closeLoginModal()

      setTimeout(() => {
        if (redirectPath) {
          navigate(redirectPath)
          clearRedirectPath()
        } else {
          navigate("/")
        }
      }, 800)
    } catch (error) {
      const data = error?.response?.data
      const message =
        data?.detail ||
        data?.full_name?.[0] ||
        data?.email?.[0] ||
        "Failed to save profile"

      toast.error("Error", {
        description: message,
        position: "bottom-center",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (resendTimer <= 0) return

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [resendTimer])

  useEffect(() => {
    if (step === "otp") {
      inputRefs.current[0]?.focus()
    }
  }, [step])

  return (
    <div className="space-y-6">
      {step === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Login / Signup</h1>
          </div>

          <div className="flex gap-2">
            <div className="flex items-center rounded-md border px-3 text-sm">
              +91
            </div>

            <Input
              type="tel"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                setPhone(value)
              }}
              maxLength={10}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Continue"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </form>
      )}

      {step === "otp" && (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Enter OTP</h1>
            <p className="text-sm text-muted-foreground">
              We sent a code to {phone}
            </p>
          </div>

          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                className="h-12 w-12 text-center text-base font-semibold"
              />
            ))}
          </div>

          <Button onClick={verifyOtp} className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="flex items-center justify-center gap-4 text-sm">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
              className="text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone")
                setOtp(["", "", "", "", "", ""])
              }}
              className="text-muted-foreground transition hover:text-foreground"
            >
              Edit Number
            </button>
          </div>
        </div>
      )}

      {step === "profile" && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Complete Profile</h1>
            <p className="text-sm text-muted-foreground">
              Tell us a little about you
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="first_name"
              placeholder="First Name"
              value={profileForm.first_name}
              onChange={handleProfileChange}
              required
            />
            <Input
              name="last_name"
              placeholder="Last Name"
              value={profileForm.last_name}
              onChange={handleProfileChange}
              required
            />
          </div>

          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={profileForm.email}
            onChange={handleProfileChange}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Finish"}
          </Button>
        </form>
      )}
    </div>
  )
}
