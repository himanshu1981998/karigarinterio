import { Button } from "@/components/ui/button"
import custombespokeimage from "../assets/Custombespokeimage.png"

const WHATSAPP_NUMBER = "9999082403"
const WHATSAPP_MESSAGE =
  "Hi, I want to enquire about a made-to-order custom bespoke furniture piece."

const CustomBespokeSection = () => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`

  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="ki-panel grid items-center gap-5 overflow-hidden rounded-2xl p-4 backdrop-blur md:grid-cols-2 md:p-8 lg:gap-10">
        {/* Left Image */}
        <div className="ki-image-surface aspect-[16/10] overflow-hidden rounded-xl md:aspect-[4/3]">
          <img
            src={custombespokeimage}
            alt="Craftsmen working on custom furniture"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm sm:tracking-[0.2em]">
            Made to Order
          </p>

          <h2 className="font-display mt-2 text-2xl font-bold leading-tight text-stone-950 sm:mt-3 sm:text-4xl">
            Custom bespoke pieces, made exactly the way you want.
          </h2>

          <p className="mt-3 text-sm leading-6 text-stone-600 sm:mt-4 sm:text-base sm:leading-7">
            From dimensions and finishes to detailing and design language, we
            craft furniture tailored to your space, style, and requirements.
          </p>

          <p className="mt-2 text-sm leading-6 text-stone-600 sm:mt-3 sm:text-base sm:leading-7">
            Share your idea with us and our team will help you bring your vision
            to life with a piece that feels truly personal.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block sm:mt-6"
          >
            <Button className="h-10 rounded-full px-5 text-sm sm:h-11 sm:px-6">
              Enquire with Our Designer
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}

export default CustomBespokeSection
