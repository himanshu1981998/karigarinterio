import React from 'react'
import RegisterForm from "@/components/RegisterForm"
import registerimage from "../assets/registerimage.jpg"

 const RegisterPage = () => {
  return (
<div className="h-screen grid lg:grid-cols-4">
       <div className="relative hidden lg:col-span-3 lg:block">
       <img
         src={registerimage}
         alt="Furniture"
         className="absolute inset-0 h-full w-full object-cover" />

                 {/* Gradient Overlay */}
       <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

        {/* Optional branding text */}
        <div className="absolute bottom-16 left-16 max-w-lg text-white">
          <h2 className="text-4xl font-bold leading-tight">
            Karigar Interio
          </h2>

          <p className="mt-4 text-lg text-white/80">
            Elegant designs crafted for comfort, style, and durability.
          </p>
        </div>


        </div>

        <div className="h-full flex items-center justify-center bg-background/80 backdrop-blur">
           <RegisterForm className="w-full max-w-md" />
          </div>

    </div>
            )
  
}
export default RegisterPage
