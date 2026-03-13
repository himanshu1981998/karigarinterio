import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const [phone, setPhone] = useState("")
  const [step, setStep] = useState("phoneWindow")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = useRef([])

  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    console.log("Send OTP to:", phone)
    setStep("otp")
    setResendTimer(30)
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

  const verifyOtp = () => {
    const finalOtp = otp.join("")
    console.log("Verify OTP:", finalOtp)
  }

  const handleResendOtp = () => {
    if (resendTimer > 0) return
    console.log("Resend OTP to:", phone)
    setResendTimer(30)
  }

  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      verifyOtp()
    }
  }, [otp])

  useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) return

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [step, resendTimer])

  useEffect(() => {
  if (step === "otp") {
    inputRefs.current[0]?.focus()
  }
}, [step])

  return (
    <div className="space-y-6">
      {step === "phoneWindow" && (
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
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
              required
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="mt-1" />
            Notify me for updates and order alerts
          </label>

          <Button type="submit" className="w-full">
            Continue
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </form>
      )}
         
         {step === "otp" && (
  <div className="space-y-6">
    <div className="space-y-2 text-center">
      <h1 className="text-3xl font-bold">OTP Verification</h1>
      <p className="text-sm text-muted-foreground">
        We sent a code to +91 {phone}
      </p>
    </div>

    <div className="flex justify-center gap-2">
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
          className={`
            h-12 w-12 rounded-lg border bg-background text-center text-base font-semibold
            shadow-sm transition-all duration-200
            focus-visible:ring-2 focus-visible:ring-primary
            focus-visible:ring-offset-2
            ${digit ? "border-primary/50" : ""}
          `}
        />
      ))}
    </div>

    <Button onClick={verifyOtp} className="w-full">
      Verify OTP
    </Button>

    <div className="flex justify-center gap-4 pt-1 text-sm">
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={resendTimer > 0}
        className="text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
      </button>

      <span className="text-muted-foreground/40">|</span>

      <button
        type="button"
        onClick={() => {
          setStep("phoneWindow")
          setOtp(["", "", "", "", "", ""])
        }}
        className="text-muted-foreground transition hover:text-foreground"
      >
        Edit Number
      </button>
    </div>
  </div>
)}
          
        
    </div>
  )
}