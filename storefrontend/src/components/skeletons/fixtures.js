const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'%3E%3Crect width='800' height='1000' fill='%23e4e4e7'/%3E%3C/svg%3E"

export const productFixture = {
  id: "fixture-product",
  name: "Handcrafted Teak Lounge Chair",
  slug: "handcrafted-teak-lounge-chair",
  sku: "KI-FIXTURE-001",
  short_description: "Solid wood seating with a warm hand-polished finish.",
  description:
    "A carefully crafted furniture piece built for everyday comfort and long-lasting use.",
  price: 12999,
  original_price: 15999,
  discount_percentage: 19,
  stock: 8,
  material_summary: "Solid teak wood",
  finish: "Natural matte polish",
  width_cm: "72.00",
  depth_cm: "82.00",
  height_cm: "88.00",
  estimated_shipping_text: "Ships in 7-10 days",
  category: {
    id: "fixture-category",
    name: "Living Room",
    slug: "living-room",
  },
  primary_image: placeholderImage,
  images: [
    { id: "fixture-image-1", image: placeholderImage, is_primary: true },
    { id: "fixture-image-2", image: placeholderImage, is_primary: false },
    { id: "fixture-image-3", image: placeholderImage, is_primary: false },
  ],
  specifications: [
    { id: "fixture-spec-1", name: "Material", value: "Solid teak wood" },
    { id: "fixture-spec-2", name: "Care", value: "Wipe with a dry cloth" },
  ],
}

export const productGridFixture = Array.from({ length: 8 }).map((_, index) => ({
  ...productFixture,
  id: `fixture-product-${index}`,
  slug: `fixture-product-${index}`,
}))

export const categoryFixture = Array.from({ length: 4 }).map((_, index) => ({
  id: `fixture-category-${index}`,
  name: ["Living Room", "Bedroom", "Dining", "Storage"][index],
  slug: ["living-room", "bedroom", "dining", "storage"][index],
  image: "",
  parent: null,
}))

export const cartItemFixture = {
  id: "fixture-cart-item",
  quantity: 2,
  line_total: "25998.00",
  product: productFixture,
}
