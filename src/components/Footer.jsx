import { Mail, Phone, MapPin } from 'lucide-react'
import './Footer.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h3>STRATEX</h3>
                    <p>
                        Strategizing Facility Excellence. Premium mobile cleaning services
                        tailored for your comfort and hygiene. Experience the gold standard in cleanliness.
                    </p>
                </div>
                <div className="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/book">Book Now</a></li>
                    </ul>
                </div>
                <div className="footer-contact">
                    <h4>Contact Us</h4>
                    <p><MapPin size={18} /> Colombo, Sri Lanka</p>
                    <p><Phone size={18} /> +94 11 234 5678</p>
                    <p><Mail size={18} />startexfacilitiesmanagement@gmail.com</p>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="copyright">
                    © 2025 STRATEX. All rights reserved.
                </div>
                <div className="socials">
                    {/* Add social links here if needed */}
                </div>
            </div>
        </footer>
    )
}

export default Footer
