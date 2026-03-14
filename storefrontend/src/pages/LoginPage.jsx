import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/LoginForm"
import registerimage from "../assets/registerimage.jpg"
import React from "react"

const LoginPage=({children}) =>{

  return (
   <Dialog>
      <DialogTrigger asChild>
          {children}
      </DialogTrigger>

      <DialogContent className="!w-[1000px] !max-w-[92vw] overflow-hidden border-0 p-0 backdrop-blur-md shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <div className="grid min-h-[680px] md:grid-cols-[1.3fr_1fr]">
          {/* LEFT SIDE IMAGE */}
          <div className="relative hidden md:block">
            <img
              src={registerimage}
              alt="Furniture"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* dark overlay */}
            
             <div className="absolute inset-0 bg-black/40" />
               <div className="absolute inset-0 bg-gradient-to-br from-green-700/30 via-transparent to-black/50" />

            <div className="absolute top-16 left-16 z-10 text-white">
                <h1 className="flex items-baseline gap-3">
                  <span className="text-6xl font-bold  drop-shadow-lg [font-family:'Hind',sans-serif]">
                        कारीगर
                    </span>

                   <span className="text-6xl font-semibold lowercase">
                        interio
                   </span>
                 </h1>

                <p className="mt-6 text-lg text-white/85 max-w-sm">
                       Make your home a comfortable place
                </p>
            </div>

          </div>

          {/* RIGHT SIDE FORM */}
          <div className="flex items-center justify-center bg-white px-10 py-12">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default LoginPage