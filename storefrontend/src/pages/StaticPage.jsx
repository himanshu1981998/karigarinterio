import { Link, useParams } from "react-router-dom"

const pages = {
  about: {
    title: "About Karigar Interio",
    intro:
      "Karigar Interio curates handcrafted furniture and interior solutions for homes that need practical comfort with a crafted finish.",
    sections: [
      {
        heading: "What We Do",
        body: "We list ready furniture, made-to-order furniture, and interior service enquiries from one storefront.",
      },
      {
        heading: "Our Promise",
        body: "Clear product details, careful order handling, and support from enquiry through delivery.",
      },
    ],
  },
  contact: {
    title: "Contact Us",
    intro: "Need help choosing furniture, tracking an order, or planning a custom piece?",
    sections: [
      { heading: "Phone", body: "+91 9999082403" },
      { heading: "Email", body: "support@KarigarInterio.com" },
      { heading: "Address", body: "Road No. 2, Upstairs Domino's Pizza, Jhunjhunu, Rajasthan" },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "We collect only the information needed to create accounts, process orders, manage delivery, payments, and service enquiries.",
    sections: [
      {
        heading: "Information We Use",
        body: "Phone number, profile details, delivery addresses, order history, payment references, and service enquiry details.",
      },
      {
        heading: "Payments",
        body: "Online payments are processed by Razorpay. We store payment identifiers and status, not full card or UPI credentials.",
      },
      {
        heading: "Support",
        body: "Contact support@KarigarInterio.com for privacy or account data requests.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro:
      "By using Karigar Interio, you agree to provide accurate order, delivery, and contact information.",
    sections: [
      {
        heading: "Orders",
        body: "Orders are confirmed after COD placement or successful online payment verification.",
      },
      {
        heading: "Product Information",
        body: "We aim to keep product prices, stock, dimensions, finishes, and images accurate. Natural materials can have small variations.",
      },
      {
        heading: "Service Enquiries",
        body: "Service requests are enquiries and become confirmed work only after direct discussion and acceptance.",
      },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    intro:
      "Shipping timelines depend on product availability, customisation, and delivery location.",
    sections: [
      {
        heading: "Order Tracking",
        body: "Once shipped, courier name, tracking number, and tracking link will appear on your order details page.",
      },
      {
        heading: "Delivery",
        body: "Large furniture deliveries may require coordination for access, lift availability, and suitable delivery timing.",
      },
    ],
  },
  returns: {
    title: "Cancellation, Return & Refund Policy",
    intro:
      "Cancellation and return requests can be raised from your order details page when the order is eligible.",
    sections: [
      {
        heading: "Cancellation",
        body: "You can request cancellation before shipment. Admin approval is required, and stock/payment updates are handled after approval.",
      },
      {
        heading: "Returns",
        body: "Return requests are available after delivery. Returned items must be reviewed and received before refund processing.",
      },
      {
        heading: "Refunds",
        body: "Online payment refunds are initiated through Razorpay after admin approval. COD refunds require manual coordination.",
      },
    ],
  },
}

const StaticPage = () => {
  const { slug = "about" } = useParams()
  const page = pages[slug] || pages.about

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-sm text-zinc-500">
          <Link to="/" className="hover:text-zinc-700 hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>{page.title}</span>
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {page.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">{page.intro}</p>

          <div className="mt-8 space-y-6">
            {page.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-lg font-semibold text-zinc-900">{section.heading}</h2>
                <p className="mt-2 leading-7 text-zinc-600">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default StaticPage
