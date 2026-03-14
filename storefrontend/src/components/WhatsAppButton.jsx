import { FaWhatsapp } from "react-icons/fa"

const WhatsAppButton = () => {
  const phoneNumber = "919876543210" // replace with your number
  const message = "Hi Karigar Interio, I need help with furniture."

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600">
        <FaWhatsapp size={28} />
      </div>
    </a>
  )
}

export default WhatsAppButton