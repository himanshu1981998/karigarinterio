import { Heart, Star } from "lucide-react"
import testimonialsRoom from "@/assets/testimonials-room.png"

const testimonials = [
  {
    name: "Ritika Sharma",
    location: "Jhunjhunu",
    review:
      "The sofa finish feels premium and the team helped us choose the right size for our living room.",
  },
  {
    name: "Aman Choudhary",
    location: "Jhunjhunu",
    review:
      "Our dining table was delivered neatly and the wood polish looks exactly like we wanted.",
  },
  {
    name: "Neha Saini",
    location: "Jhunjhunu",
    review:
      "Loved the custom wardrobe work. The measurements, fitting, and finish were handled very professionally.",
  },
  {
    name: "Rahul Verma",
    location: "Jhunjhunu",
    review:
      "The product quality is solid, and the team kept us updated from selection to delivery.",
  },
  {
    name: "Priya Beniwal",
    location: "Jhunjhunu",
    review:
      "Karigar Interio made our room feel warmer without making it look crowded. Very happy with the design advice.",
  },
  {
    name: "Mohit Singh",
    location: "Jhunjhunu",
    review:
      "Good service, clean installation, and furniture that feels sturdy for daily family use.",
  },
]

const Rating = () => (
  <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className="h-3 w-3 fill-[#d8b46f] text-[#d8b46f]"
        aria-hidden="true"
      />
    ))}
  </div>
)

const TestimonialCard = ({ testimonial }) => (
  <article className="flex min-h-[168px] flex-col justify-between rounded-xl border border-white/20 bg-white/82 p-4 text-stone-900 shadow-[0_14px_35px_rgba(19,14,9,0.16)] backdrop-blur-md sm:min-h-[182px]">
    <div>
      <Rating />
      <p className="mt-3 text-xs leading-5 text-stone-700 sm:text-[13px]">
        "{testimonial.review}"
      </p>
    </div>

    <div className="mt-4 border-t border-stone-200/70 pt-3">
      <p className="text-xs font-semibold text-stone-950 sm:text-sm">
        {testimonial.name}
      </p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-primary/80 sm:text-xs">
        {testimonial.location}
      </p>
    </div>
  </article>
)

const TestimonialsSection = () => {
  return (
    <section className="mt-12 overflow-hidden bg-stone-950 shadow-[0_24px_70px_rgba(42,34,25,0.16)] sm:mt-14 lg:mt-16">
      <div className="relative min-h-[520px] overflow-hidden sm:min-h-[590px] lg:min-h-[650px]">
        <img
          src={testimonialsRoom}
          alt="Minimal living room with handcrafted furniture"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/46 via-stone-950/18 to-stone-950/56" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
              <Heart className="h-5 w-5 fill-white text-white" aria-hidden="true" />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
              Customer Stories
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              What our customers say
            </h2>
          </div>

          <div className="mt-7 sm:hidden">
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="w-[76vw] max-w-[310px] shrink-0 snap-center"
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
            <p className="mt-1 text-center text-xs font-medium uppercase tracking-[0.16em] text-white/60">
              Swipe reviews
            </p>
          </div>

          <div className="mt-8 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
