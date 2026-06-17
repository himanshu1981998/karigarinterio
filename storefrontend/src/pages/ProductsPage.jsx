import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { Skeleton } from "boneyard-js/react"

import ProductGrid from "@/components/ProductGrid"
import PaginationControls from "@/components/PaginationControls"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { fetchCategories, fetchProducts } from "@/lib/productApi.js"
import useDebounce from "@/hooks/useDebounce"
import {
  ProductGridFixture,
  ProductGridSkeleton,
} from "@/components/skeletons/BoneyardSkeletons"
import { productGridFixture } from "@/components/skeletons/fixtures"
import { isBoneyardBuild } from "@/lib/boneyardBuild"

const sortOptions = [
  { value: "", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
]

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const [totalCount, setTotalCount] = useState(0)

  const categoryFromURL = searchParams.get("category") || ""
  const searchFromURL = searchParams.get("search") || ""
  const minPriceFromURL = searchParams.get("min_price") || ""
  const maxPriceFromURL = searchParams.get("max_price") || ""
  const sortFromURL = searchParams.get("sort") || ""
  const saleFromURL = searchParams.get("sale") || ""

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [filters, setFilters] = useState({
    category: categoryFromURL,
    search: searchFromURL,
    minPrice: minPriceFromURL,
    maxPrice: maxPriceFromURL,
    sort: sortFromURL,
    sale: saleFromURL,
  })

  const [openDesktopMenu, setOpenDesktopMenu] = useState(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const dropdownRef = useRef(null)

  const debouncedSearch = useDebounce(filters.search, 500)
  const isSkeletonCapture = isBoneyardBuild()


  useEffect(() => {
    setFilters({
      category: categoryFromURL,
      search: searchFromURL,
      minPrice: minPriceFromURL,
      maxPrice: maxPriceFromURL,
      sort: sortFromURL,
      sale: saleFromURL,
    })
  }, [
    categoryFromURL,
    searchFromURL,
    minPriceFromURL,
    maxPriceFromURL,
    sortFromURL,
    saleFromURL,
  ])

  useEffect(() => {
    setPage(Number(searchParams.get("page")) || 1)
  }, [searchParams])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDesktopMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const loadCategories = async () => {
      try {
        const data = await fetchCategories({
          signal: controller.signal,
        })
        setCategories(data)
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Failed to fetch categories:", err.message)
        }
      }
    }

    loadCategories()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const loadProducts = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await fetchProducts(
          {
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            sort: filters.sort,
            sale: filters.sale,
            search: debouncedSearch,
            page,
          },
          {
            signal: controller.signal,
          }
        )

        setProducts(data?.results || [])
        setTotalCount(data?.count || 0)
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(err.message || "Failed to fetch products")
        }
      } finally {
        setLoading(false)
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    filters.sale,
    debouncedSearch,
    page,
  ])

  const currentCategory = useMemo(() => {
    return categories.find((cat) => cat.slug === filters.category) || null
  }, [categories, filters.category])

  const activeSortLabel =
    sortOptions.find((option) => option.value === filters.sort)?.label ||
    "Featured"

  const updateURLParams = (nextFilters, nextPage = 1) => {
    const params = new URLSearchParams()

    if (nextFilters.category) params.set("category", nextFilters.category)
    if (nextFilters.search) params.set("search", nextFilters.search)
    if (nextFilters.minPrice) params.set("min_price", nextFilters.minPrice)
    if (nextFilters.maxPrice) params.set("max_price", nextFilters.maxPrice)
    if (nextFilters.sort) params.set("sort", nextFilters.sort)
    if (nextFilters.sale) params.set("sale", nextFilters.sale)
    if (nextPage > 1) params.set("page", nextPage)

    setSearchParams(params)
  }

  const handleSetFilters = (updater) => {
  let nextFilters

  if (typeof updater === "function") {
    nextFilters = updater(filters)
  } else {
    nextFilters = { ...filters, ...updater }
  }

  setFilters(nextFilters)
  setPage(1)
  updateURLParams(nextFilters, 1)
}

  const handleReset = () => {
    const resetFilters = {
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      sort: "",
      sale: "",
    }

    setFilters(resetFilters)
    setPage(1)
    setSearchParams({})
    setOpenDesktopMenu(null)
    setIsMobileFilterOpen(false)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    updateURLParams(filters, newPage)
  }

  const activeFilterCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    filters.sale,
  ].filter(Boolean).length

  return (
    <div className="ki-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-4 text-sm text-stone-500">
          <Link to="/" className="hover:text-stone-800 hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Products</span>
          {currentCategory && (
            <>
              <span className="mx-2">/</span>
              <span className="font-medium text-stone-900">
                {currentCategory.name}
              </span>
            </>
          )}
        </div>

        <div className="ki-panel mb-7 overflow-hidden rounded-2xl px-6 py-7 text-center backdrop-blur sm:px-8 sm:py-9">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
            Karigar Interio Collection
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
            {filters.sale ? "Sale" : currentCategory ? currentCategory.name : "All Products"}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base">
            Explore handcrafted furniture and home decor.
          </p>
        </div>

        {/* Desktop Filter Bar */}
        <div
          ref={dropdownRef}
          className="ki-panel mb-6 hidden items-center justify-between gap-6 rounded-2xl px-5 py-4 backdrop-blur lg:flex"
        >
          <div className="flex items-center gap-6 text-sm text-stone-700">
            <span className="font-semibold text-stone-900">Filter</span>

            {/* Category */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDesktopMenu((prev) =>
                    prev === "category" ? null : "category"
                  )
                }
                className="flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                <span>{currentCategory ? currentCategory.name : "Category"}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {openDesktopMenu === "category" && (
                <div className="absolute left-0 top-full z-30 mt-4 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-950/10">
                  <button
                    type="button"
                    onClick={() => {
                      handleSetFilters((prev) => ({
                        ...prev,
                        category: "",
                      }))
                      setOpenDesktopMenu(null)
                    }}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-stone-100 ${
                      !filters.category ? "bg-stone-100 font-medium text-stone-950" : "text-stone-700"
                    }`}
                  >
                    All Categories
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        handleSetFilters((prev) => ({
                          ...prev,
                          category: cat.slug,
                        }))
                        setOpenDesktopMenu(null)
                      }}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-stone-100 ${
                        filters.category === cat.slug
                          ? "bg-stone-100 font-medium text-stone-950"
                          : "text-stone-700"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDesktopMenu((prev) =>
                    prev === "price" ? null : "price"
                  )
                }
                className="flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                <span>Price</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {openDesktopMenu === "price" && (
                <div className="absolute left-0 top-full z-30 mt-4 w-72 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-950/10">
                  <p className="mb-3 text-sm font-medium text-stone-950">
                    Filter by price
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleSetFilters((prev) => ({
                          ...prev,
                          minPrice: e.target.value,
                        }))
                      }
                      className="rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />

                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleSetFilters((prev) => ({
                          ...prev,
                          maxPrice: e.target.value,
                        }))
                      }
                      className="rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOpenDesktopMenu(null)}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-stone-700">
            {/* Sort */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDesktopMenu((prev) =>
                    prev === "sort" ? null : "sort"
                  )
                }
                className="flex items-center gap-2 rounded-full px-3 py-2 text-[15px] text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                <span>Sort by: {activeSortLabel}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {openDesktopMenu === "sort" && (
                <div className="absolute right-0 top-full z-30 mt-4 w-60 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-950/10">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value || "featured"}
                      type="button"
                      onClick={() => {
                        handleSetFilters((prev) => ({
                          ...prev,
                          sort: option.value,
                        }))
                        setOpenDesktopMenu(null)
                      }}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-stone-100 ${
                        filters.sort === option.value
                          ? "bg-stone-100 font-medium text-stone-950"
                          : !filters.sort && option.value === ""
                            ? "bg-stone-100 font-medium text-stone-950"
                            : "text-stone-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!loading && !error && (
              <span className="text-[15px] font-medium text-stone-500">
                {totalCount} product{totalCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Filter Bar */}
        <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
          <Button
            variant="outline"
            className="rounded-full bg-white/90"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {!loading && !error && (
            <p className="text-sm font-medium text-stone-500">
              {totalCount} product{totalCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {(filters.category ||
          filters.minPrice ||
          filters.maxPrice ||
          filters.sort) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {filters.category && currentCategory && (
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm">
                {currentCategory.name}
                <button
                  type="button"
                  onClick={() =>
                    handleSetFilters((prev) => ({
                      ...prev,
                      category: "",
                    }))
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}

            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm">
                ₹{filters.minPrice || "0"} - ₹{filters.maxPrice || "∞"}
                <button
                  type="button"
                  onClick={() =>
                    handleSetFilters((prev) => ({
                      ...prev,
                      minPrice: "",
                      maxPrice: "",
                    }))
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}

            {filters.sort && (
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm">
                {activeSortLabel}
                <button
                  type="button"
                  onClick={() =>
                    handleSetFilters((prev) => ({
                      ...prev,
                      sort: "",
                    }))
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="rounded-full px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Clear all
            </button>
          </div>
        )}

        <section>
          {loading || isSkeletonCapture ? (
             <Skeleton
              name="product-grid"
              loading={loading || isSkeletonCapture}
              fallback={<ProductGridSkeleton />}
              fixture={<ProductGridFixture />}
             >
              <ProductGrid products={productGridFixture} />
             </Skeleton>
          ) : error ? (
            <div className="ki-soft-card rounded-2xl p-8 text-center text-red-600">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="ki-soft-card rounded-2xl p-10 text-center text-stone-500">
              <p className="text-lg font-semibold text-stone-900">No products found</p>
              <p className="mt-2 text-sm">
              No products found for the selected filters.
              </p>
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              <PaginationControls
                page={page}
                totalCount={totalCount}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </div>

      {/* Mobile Bottom Filter Sheet */}
      <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-stone-200 bg-[#f7f7f5] px-0">
          <div className="mx-auto w-full max-w-md px-5 pb-6 pt-2">
            <SheetHeader className="px-0 text-left">
              <SheetTitle className="text-lg font-semibold text-stone-950">
                Filters
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleSetFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Price Range
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleSetFilters((prev) => ({
                        ...prev,
                        minPrice: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />

                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleSetFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) =>
                    handleSetFilters((prev) => ({
                      ...prev,
                      sort: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value || "featured"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    className="h-11 flex-1 rounded-full"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>

                  <Button
                    className="h-11 flex-1 rounded-full"
                    onClick={() => setIsMobileFilterOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default ProductsPage
