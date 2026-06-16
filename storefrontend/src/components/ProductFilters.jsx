import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const ProductFilters = ({
  categories,
  filters,
  setFilters,
  onReset,
}) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-zinc-900">Filters</h2>

      <div className="mt-5 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Search
          </label>
          <Input
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="Search products"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleChange("minPrice", e.target.value)}
              placeholder="Min"
            />
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleChange("maxPrice", e.target.value)}
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Sort By
          </label>
          <select
            value={filters.sort}
            onChange={(e) => handleChange("sort", e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="w-full rounded-xl"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  )
}

export default ProductFilters