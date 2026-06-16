import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Skeleton } from "boneyard-js/react"

import logo from "../assets/logo.svg"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import LoginPage from "../pages/LoginPage"
import { UserDropdown } from "./UserDropdown"

import { useAuthStore } from "@/store/authStore"
import { useCartStore } from "@/store/cartStore"
import { useAuthModalStore } from "@/store/authModalStore"

import useDebounce from "@/hooks/useDebounce"
import { fetchProducts } from "@/lib/productApi.js"
import { SearchResultsSkeleton } from "@/components/skeletons/BoneyardSkeletons"
import { isBoneyardBuild } from "@/lib/boneyardBuild"

const Header = () => {
  const navigate = useNavigate()

  const openCart = useCartStore((state) => state.openCart)
  const totalItems = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  )
  const cartBump = useCartStore((state) => state.cartBump)

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  const isLoginOpen = useAuthModalStore((state) => state.isLoginOpen)
  const closeLoginModal = useAuthModalStore((state) => state.closeLoginModal)
  const openLoginModal = useAuthModalStore((state) => state.openLoginModal)

  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    const loadResults = async () => {
      try {
        setLoading(true)

        const data = await fetchProducts({
          search: debouncedSearch,
          limit: 6,
        })

        setResults(data?.results || data || [])
      } catch (err) {
        console.error("Search error:", err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [debouncedSearch])

  const clearSearch = () => {
    setSearch("")
    setResults([])
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!search.trim()) return

    navigate(`/products?search=${encodeURIComponent(search.trim())}`)
    clearSearch()
    setIsMobileMenuOpen(false)
  }

  const handleResultClick = (slug) => {
    navigate(`/product/${slug}`)
    clearSearch()
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        {/* ================= ROW 1 ================= */}
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
          {/* LEFT → MOBILE MENU + LOGO */}
          <div className="flex flex-1 items-center gap-2">
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-[300px] p-0">
                  <MobileMenu
                    isLoggedIn={isLoggedIn}
                    openLoginModal={openLoginModal}
                    closeMenu={() => setIsMobileMenuOpen(false)}
                    search={search}
                    setSearch={setSearch}
                    results={results}
                    loading={loading}
                    handleSearch={handleSearch}
                    handleResultClick={handleResultClick}
                  />
                </SheetContent>
              </Sheet>
            </div>

<Link to="/" className="flex min-w-0 items-center gap-2 whitespace-nowrap">
  <img src={logo} alt="Karigar Logo" className="h-8 w-8" />
  <span className="text-sm font-semibold tracking-tight whitespace-nowrap sm:text-lg">
    कारीगर <span className="font-medium">interio</span>
  </span>
</Link>
          </div>

          {/* CENTER → DESKTOP SEARCH */}
          <div className="hidden flex-[2] justify-center md:flex">
            <SearchBox
              search={search}
              setSearch={setSearch}
              results={results}
              loading={loading}
              handleSearch={handleSearch}
              handleResultClick={handleResultClick}
            />
          </div>

          {/* RIGHT → ICONS */}
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <a
              href="https://wa.me/919876543210?text=Hi%20Karigar%20Interio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-green-600"
              >
                <FaWhatsapp className="h-5 w-5" />
              </Button>
            </a>

            <Button
              variant="ghost"
              size="icon"
              className={`relative transition-transform duration-300 ${
                cartBump ? "scale-125" : "scale-100"
              }`}
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8B5E3C] text-xs text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>

            {isLoggedIn ? (
              <UserDropdown />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={openLoginModal}
                aria-label="Open login"
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>



        {/* ================= ROW 2 (DESKTOP NAV) ================= */}
        <div className="hidden border-t border-zinc-100 md:block">
          <nav className="mx-auto flex h-12 max-w-7xl items-center justify-center gap-8 text-sm font-medium text-zinc-700">
            <Link
              to="/products?category=living-room"
              className="transition hover:text-black"
            >
              Living Room
            </Link>

            <Link
              to="/products?category=bedroom"
              className="transition hover:text-black"
            >
              Bedroom
            </Link>

            <Link
              to="/products?category=dining"
              className="transition hover:text-black"
            >
              Dining
            </Link>



            <Link to="/services" className="transition hover:text-black">
              Services
            </Link>

            <Link to="/products?sale=true" className="transition hover:text-red-700 text-red-600">
              Sale
            </Link>
          </nav>
        </div>
      </header>

      <LoginPage open={isLoginOpen} onOpenChange={closeLoginModal} />
    </>
  )
}

function SearchBox({
  search,
  setSearch,
  results,
  loading,
  handleSearch,
  handleResultClick,
}) {
  const isSkeletonCapture = isBoneyardBuild()

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={handleSearch}
        className="flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm focus-within:border-[#8B5E3C]"
      >
        <Search className="h-4 w-4 shrink-0 text-zinc-400" />
        <input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
      </form>

      {(search || isSkeletonCapture) && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
          {(loading || isSkeletonCapture) && (
            <Skeleton
              name="header-search-results"
              loading={loading || isSkeletonCapture}
              fallback={<SearchResultsSkeleton />}
              fixture={<SearchResultsSkeleton />}
            >
              <div>
                {Array.from({ length: 5 }).map((_, index) => (
              <button
              key={index}
              type="button"
              className="block w-full px-4 py-2 text-left text-sm text-zinc-800"
                 >
              Premium Wooden Chair
            </button>
               ))}
              </div>
            </Skeleton>
          )}

          {!loading && results.length === 0 && (
            <p className="p-3 text-sm text-zinc-500">No results found</p>
          )}

          {!loading &&
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleResultClick(item.slug)}
                className="block w-full px-4 py-2 text-left text-sm text-zinc-800 transition hover:bg-zinc-100"
              >
                {item.name}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

function MobileMenu({
  isLoggedIn,
  openLoginModal,
  closeMenu,
  search,
  setSearch,
  results,
  loading,
  handleSearch,
  handleResultClick,
}) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold text-zinc-900">Menu</h2>
      </div>

      <div className="border-b px-5 py-4">
        <SearchBox
          search={search}
          setSearch={setSearch}
          results={results}
          loading={loading}
          handleSearch={handleSearch}
          handleResultClick={handleResultClick}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-1">
          <Link
            to="/"
            onClick={closeMenu}
            className="block rounded-xl px-3 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() => setIsCategoriesOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            <span>Categories</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isCategoriesOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {isCategoriesOpen && (
            <div className="ml-3 space-y-1 border-l border-zinc-200 pl-3">
              <Link
                to="/products?category=living-room"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                Living Room
              </Link>

              <Link
                to="/products?category=bedroom"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                Bedroom
              </Link>

              <Link
                to="/products?category=dining"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                Dining
              </Link>


            </div>
          )}

          <div className="mt-3 border-t border-zinc-200 pt-3">
            <Link
              to="/services"
              onClick={closeMenu}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              Services
            </Link>

            <Link
              to="/products?sale=true"
              onClick={closeMenu}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
            >
              Sale
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t px-5 py-4">
        {isLoggedIn ? (
          <Link
            to="/profile"
            onClick={closeMenu}
            className="block rounded-xl border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
          >
            My Account
          </Link>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              closeMenu()
              openLoginModal()
            }}
          >
            Login
          </Button>
        )}
      </div>
    </div>
  )
}

export default Header
