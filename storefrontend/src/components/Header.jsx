import { Link, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
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

const RECENT_SEARCHES_KEY = "karigar_recent_searches"
const MAX_RECENT_SEARCHES = 5

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
  const [searchError, setSearchError] = useState("")
  const [recentSearches, setRecentSearches] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    try {
      const storedSearches = JSON.parse(
        window.localStorage.getItem(RECENT_SEARCHES_KEY) || "[]"
      )

      if (Array.isArray(storedSearches)) {
        setRecentSearches(
          storedSearches
            .filter((item) => typeof item === "string" && item.trim())
            .slice(0, MAX_RECENT_SEARCHES)
        )
      }
    } catch {
      setRecentSearches([])
    }
  }, [])

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults([])
      setLoading(false)
      setSearchError("")
      return
    }

    const controller = new AbortController()

    const loadResults = async () => {
      try {
        setLoading(true)
        setSearchError("")

        const data = await fetchProducts(
          {
            search: debouncedSearch,
            pageSize: 6,
          },
          {
            signal: controller.signal,
          }
        )

        setResults(data?.results || data || [])
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Search error:", err)
          setSearchError("Search failed, try again")
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadResults()

    return () => controller.abort()
  }, [debouncedSearch])

  const saveRecentSearch = (value) => {
    const term = value.trim()
    if (!term) return

    setRecentSearches((prev) => {
      const nextSearches = [
        term,
        ...prev.filter((item) => item.toLowerCase() !== term.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES)

      try {
        window.localStorage.setItem(
          RECENT_SEARCHES_KEY,
          JSON.stringify(nextSearches)
        )
      } catch {
        // Local storage can fail in private browsing; search should still work.
      }

      return nextSearches
    })
  }

  const clearRecentSearches = () => {
    setRecentSearches([])

    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch {
      // Ignore storage errors; UI state is already cleared.
    }
  }

  const clearSearch = () => {
    setSearch("")
    setResults([])
    setLoading(false)
    setSearchError("")
  }

  const handleSearch = (event, value = search) => {
    event?.preventDefault?.()
    const term = value.trim()
    if (!term) return

    saveRecentSearch(term)
    navigate(`/products?search=${encodeURIComponent(term)}`)
    clearSearch()
    setIsMobileMenuOpen(false)
  }

  const handleRecentSearchClick = (term) => {
    handleSearch(null, term)
  }

  const handleResultClick = (slug) => {
    navigate(`/product/${slug}`)
    clearSearch()
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 shadow-sm shadow-stone-950/5 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
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
                    clearSearch={clearSearch}
                    results={results}
                    loading={loading}
                    searchError={searchError}
                    recentSearches={recentSearches}
                    clearRecentSearches={clearRecentSearches}
                    handleSearch={handleSearch}
                    handleRecentSearchClick={handleRecentSearchClick}
                    handleResultClick={handleResultClick}
                  />
                </SheetContent>
              </Sheet>
            </div>

            <Link to="/" className="flex min-w-0 items-center gap-2 whitespace-nowrap">
              <img src={logo} alt="Karigar Logo" className="h-8 w-8" />
              <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-stone-950 sm:text-lg">
                कारीगर <span className="font-medium">interio</span>
              </span>
            </Link>
          </div>

          <div className="hidden flex-[2] justify-center md:flex">
            <SearchBox
              search={search}
              setSearch={setSearch}
              clearSearch={clearSearch}
              results={results}
              loading={loading}
              searchError={searchError}
              recentSearches={recentSearches}
              clearRecentSearches={clearRecentSearches}
              handleSearch={handleSearch}
              handleRecentSearchClick={handleRecentSearchClick}
              handleResultClick={handleResultClick}
            />
          </div>

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
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
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

        <div className="hidden border-t border-stone-100 md:block">
          <nav className="mx-auto flex h-12 max-w-7xl items-center justify-center gap-8 text-sm font-medium text-stone-700">
            <Link
              to="/products?category=living-room"
              className="transition hover:text-primary"
            >
              Living Room
            </Link>

            <Link
              to="/products?category=bedroom"
              className="transition hover:text-primary"
            >
              Bedroom
            </Link>

            <Link
              to="/products?category=dining"
              className="transition hover:text-primary"
            >
              Dining
            </Link>

            <Link to="/services" className="transition hover:text-primary">
              Services
            </Link>

            <Link to="/products?sale=true" className="text-red-600 transition hover:text-red-700">
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
  clearSearch,
  results,
  loading,
  searchError,
  recentSearches,
  clearRecentSearches,
  handleSearch,
  handleRecentSearchClick,
  handleResultClick,
}) {
  const isSkeletonCapture = isBoneyardBuild()
  const wrapperRef = useRef(null)
  const handledEnterRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const query = search.trim()
  const hasQuery = Boolean(query)
  const showRecentSearches = !hasQuery && recentSearches.length > 0
  const showSearchResults = hasQuery || isSkeletonCapture
  const showDropdown = isOpen && (showRecentSearches || showSearchResults)
  const availableResults = !loading && !searchError ? results : []
  const safeActiveIndex =
    activeIndex >= 0 && activeIndex < availableResults.length ? activeIndex : -1

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const openProductResult = (item) => {
    if (!item?.slug) return
    setIsOpen(false)
    setActiveIndex(-1)
    handleResultClick(item.slug)
  }

  const submitSearch = (event, value = search) => {
    setIsOpen(false)
    setActiveIndex(-1)
    handleSearch(event, value)
  }

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault()
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }

    if (!hasQuery || availableResults.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((prev) =>
        prev >= availableResults.length - 1 ? 0 : prev + 1
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((prev) =>
        prev <= 0 ? availableResults.length - 1 : prev - 1
      )
      return
    }

    if (event.key === "Enter" && safeActiveIndex >= 0) {
      event.preventDefault()
      handledEnterRef.current = true
      openProductResult(availableResults[safeActiveIndex])
      return
    }

    if (event.key === "Enter" && hasQuery) {
      event.preventDefault()
      handledEnterRef.current = true
      submitSearch(event)
    }
  }

  const handleKeyUp = (event) => {
    if (event.key !== "Enter" || !hasQuery) return

    if (handledEnterRef.current) {
      handledEnterRef.current = false
      return
    }

    event.preventDefault()
    submitSearch(event)
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <form
        onSubmit={submitSearch}
        className="flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 shadow-sm shadow-stone-950/5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
      >
        <Search className="h-4 w-4 shrink-0 text-stone-400" />
        <input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className="ml-2 w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              clearSearch()
              setIsOpen(false)
            }}
            className="ml-2 rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="absolute top-full z-50 mt-2 max-h-[70vh] w-full overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-950/10">
          {showRecentSearches && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Recent searches
                </p>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear
                </button>
              </div>

              {recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    handleRecentSearchClick(item)
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-stone-800 transition hover:bg-stone-100"
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {showSearchResults && (
            <>
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
                        className="block w-full px-4 py-2 text-left text-sm text-stone-800"
                      >
                        Premium Wooden Chair
                      </button>
                    ))}
                  </div>
                </Skeleton>
              )}

              {!loading && searchError && (
                <p className="p-3 text-sm font-medium text-red-600">
                  {searchError}
                </p>
              )}

              {!loading && !searchError && results.length === 0 && (
                <p className="p-3 text-sm text-stone-500">
                  No matching products
                </p>
              )}

              {!loading &&
                !searchError &&
                results.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openProductResult(item)}
                    className={`block w-full px-4 py-2.5 text-left text-sm font-medium text-stone-800 transition hover:bg-stone-100 ${
                      safeActiveIndex === index ? "bg-stone-100 text-stone-950" : ""
                    }`}
                  >
                    {item.name}
                  </button>
                ))}

              {!loading && !searchError && hasQuery && (
                <button
                  type="button"
                  onClick={() => submitSearch(null)}
                  className="block w-full border-t border-stone-100 px-4 py-3 text-left text-sm font-semibold text-primary transition hover:bg-stone-50"
                >
                  View all results for "{query}"
                </button>
              )}
            </>
          )}
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
  clearSearch,
  results,
  loading,
  searchError,
  recentSearches,
  clearRecentSearches,
  handleSearch,
  handleRecentSearchClick,
  handleResultClick,
}) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)

  return (
    <div className="flex h-full flex-col bg-[#f7f7f5]">
      <div className="border-b border-stone-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-stone-950">Menu</h2>
      </div>

      <div className="border-b border-stone-200 px-5 py-4">
        <SearchBox
          search={search}
          setSearch={setSearch}
          clearSearch={clearSearch}
          results={results}
          loading={loading}
          searchError={searchError}
          recentSearches={recentSearches}
          clearRecentSearches={clearRecentSearches}
          handleSearch={handleSearch}
          handleRecentSearchClick={handleRecentSearchClick}
          handleResultClick={handleResultClick}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-1">
          <Link
            to="/"
            onClick={closeMenu}
            className="block rounded-xl px-3 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-100"
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() => setIsCategoriesOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-100"
          >
            <span>Categories</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isCategoriesOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {isCategoriesOpen && (
            <div className="ml-3 space-y-1 border-l border-stone-200 pl-3">
              <Link
                to="/products?category=living-room"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                Living Room
              </Link>

              <Link
                to="/products?category=bedroom"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                Bedroom
              </Link>

              <Link
                to="/products?category=dining"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                Dining
              </Link>
            </div>
          )}

          <div className="mt-3 border-t border-stone-200 pt-3">
            <Link
              to="/services"
              onClick={closeMenu}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-stone-950 transition hover:bg-stone-100"
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

      <div className="border-t border-stone-200 px-5 py-4">
        {isLoggedIn ? (
          <Link
            to="/profile"
            onClick={closeMenu}
            className="block rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-stone-950 transition hover:bg-stone-50"
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
