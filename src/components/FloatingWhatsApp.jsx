import { MessageCircle } from 'lucide-react'
import './FloatingWhatsApp.css'

const FloatingWhatsApp = () => {
    const phoneNumber = '94771234567'
    const message = 'Hello STRATEX, I have a question about your services.'
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-whatsapp"
            title="Chat with us on WhatsApp"
        >
            <div className="whatsapp-pulse"></div>
            <MessageCircle size={32} />
            <span className="whatsapp-tooltip">Chat with us</span>
        </a>
    )
}

export default FloatingWhatsApp
