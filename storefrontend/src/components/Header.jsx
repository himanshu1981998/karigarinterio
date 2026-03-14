import { Link } from "react-router-dom"
import { ShoppingBag, Package, User } from "lucide-react"
import logo from "../assets/logo.svg"
import { FaWhatsapp } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import LoginPage from "../pages/LoginPage"
import { UserDropdown } from "./UserDropdown"
import { useCartStore } from "@/store/cartStore"

const Header=()=> {
 const openCart = useCartStore((state) => state.openCart)

 const isLoggedIn=true
 


  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side → Logo + Brand */}

        <Link to="/" className="flex items-center gap-2">
           <img src={logo} alt="Karigar Logo" className="h-8 w-8" />
             <span className="text-xl font-semibold tracking-tight">
                कारीगर <span className="font-medium">interio</span>
                </span>
        </Link>

        
        <div className="flex items-center gap-3">

          {/*whatsapp*/}
        <a
            href="https://wa.me/919876543210?text=Hi%20Karigar%20Interio"
            target="_blank"
            rel="noopener noreferrer"
            >
                <Button variant="ghost" size="icon" className="hover:text-green-600">
                  <FaWhatsapp className="h-5 w-5" />
                </Button>
          </a>
    

          {/* Cart */}
          <Button variant="ghost" size="icon" onClick={openCart}>
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Open cart</span>
          </Button>

                {/*change of button accorind to logged in or not*/}
                 {isLoggedIn ? <UserDropdown /> : 
                 <LoginPage>
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                   </LoginPage>}

       
                
        </div>
      </div>
    </header>
  )
}

export default Header