import { Link } from "react-router-dom"
import { Phone, Mail, MapPin } from "lucide-react"
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa"

const WHATSAPP_NUMBER = "919086699653"
const WHATSAPP_MESSAGE = "Hi, I want to enquire about your products."

const Footer = () => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`

  return (
    <footer className="mt-16 bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div>
            <h2 className="text-xl font-semibold text-white">
              Karigar Interio
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Curators of fine Interiors and Bespoke Furniture.
              Premium furniture designed for modern living.
            
            </p>

            {/* SOCIALS */}
            <div className="mt-5 flex items-center gap-4">
              <a
                href="https://www.instagram.com/karigarinterio?igsh=MTJyZ2JqcnZpb3hrcA=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-lg"
              >
                <FaInstagram className="h-5 w-5 text-[#E1306C]" />
              </a>

              <a
                href="https://facebook.com/yourbrand"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-lg"
              >
                <FaFacebookF className="h-5 w-5 text-[#1877F2]" />
              </a>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-lg"
              >
                <FaWhatsapp className="h-5 w-5 text-[#25D366]" />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Quick Links
            </h3>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="transition hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* CUSTOMER */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Customer
            </h3>

            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/orders" className="transition hover:text-white">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/MyProfile" className="transition hover:text-white">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-white">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="transition hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="transition hover:text-white">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Contact
            </h3>

            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91 9999082403
              </li>

              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                support@KarigarInterio.com
              </li>

              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4" />
                Road No. 2, Upstairs Domino's Pizza,
                Jhunjhunu(Rajasthan)
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8 h-px bg-zinc-800" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} KarigarInterio. All rights reserved.</p>

          <div className="flex gap-4">
            <Link to="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
