import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const RegisterForm=({ className, ...props }) =>{
  return (
    <div className={cn("h-full w-full", className)} {...props}>
      <Card className="h-full overflow-hidden rounded-none border-1 shadow-none">
        <CardContent className="grid h-full p-0 ">
     

          {/* Right Side Form - takes 1 column */}
          <div className="flex h-full items-center justify-center bg-background px-6 py-6 sm:px-10">
            <form className="w-full max-w-md">
              <FieldGroup className="gap-5">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Create your account
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Sign up to start shopping with us.
                  </p>
                </div>

                {/* First + Last Name */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="John"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Doe"
                      required
                    />
                  </Field>
                </div>

                {/* Email */}
                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </Field>

                {/* Phone */}
                <Field>
                  <FieldLabel htmlFor="phone_number">Phone Number</FieldLabel>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="9876543210"
                    required
                  />
                </Field>

                {/* Password */}
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </Field>

                {/* Confirm Password */}
                <Field>
                  <FieldLabel htmlFor="confirm_password">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    placeholder="Confirm your password"
                    required
                  />
                </Field>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" className="mt-1" />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-5 text-muted-foreground"
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-foreground underline underline-offset-4"
                    >
                      privacy policy
                    </a>{" "}
                    &{" "}
                    <a
                      href="#"
                      className="text-foreground underline underline-offset-4"
                    >
                      terms
                    </a>
                  </label>
                </div>

                {/* Button */}
                <Button type="submit" className="w-full">
                  Create Account
                </Button>

                {/* Sign in */}
                <FieldDescription className="text-center text-sm">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    Sign in instead
                  </a>
                </FieldDescription>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-background">
                  or
                </FieldSeparator>

                <Button variant="outline" type="button" className="w-full">
                  Sign in with Google
                </Button>
              </FieldGroup>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default RegisterForm