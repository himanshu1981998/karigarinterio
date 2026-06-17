import { Button } from "@/components/ui/button"
import custombespokeimage from "../assets/Custombespokeimage.png"

const WHATSAPP_NUMBER = "919086699653"
const WHATSAPP_MESSAGE =
  "Hi, I want to enquire about a made-to-order custom bespoke furniture piece."

const CustomBespokeSection = () => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="ki-panel grid items-center gap-8 overflow-hidden rounded-2xl p-6 backdrop-blur md:grid-cols-2 md:p-10 lg:gap-12">
        {/* Left Image */}
        <div className="ki-image-surface overflow-hidden rounded-xl">
          <img
            src={custombespokeimage}
            alt="Craftsmen working on custom furniture"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Made to Order
          </p>

          <h2 className="font-display mt-3 text-3xl font-bold leading-tight text-stone-950 sm:text-4xl">
            Custom bespoke pieces, made exactly the way you want.
          </h2>

          <p className="mt-4 text-base leading-7 text-stone-600">
            From dimensions and finishes to detailing and design language, we
            craft furniture tailored to your space, style, and requirements.
          </p>

          <p className="mt-3 text-base leading-7 text-stone-600">
            Share your idea with us and our team will help you bring your vision
            to life with a piece that feels truly personal.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block"
          >
            <Button className="h-11 rounded-full px-6">
              Enquire with Our Designer
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}

export default CustomBespokeSection
