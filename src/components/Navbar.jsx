import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Calendar, LayoutDashboard, Home as HomeIcon, PhoneCall } from 'lucide-react'
import { useState } from 'react'
import './Navbar.css'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    return (
        <header className="nav-header">
            <nav className="navbar glass-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-text-logo">
                        STRATEX
                    </Link>

                    {/* Desktop Menu */}
                    <div className="nav-links-wrapper">
                        <div className="nav-links">
                            <a href="/#hero" className={location.hash === '#hero' || (location.pathname === '/' && !location.hash) ? 'active' : ''}>
                                Home
                            </a>
                            <a href="/#services" className={location.hash === '#services' ? 'active' : ''}>
                                Services
                            </a>
                            <a href="/#about" className={location.hash === '#about' ? 'active' : ''}>
                                About
                            </a>
                        </div>

                        <div className="nav-actions">
                            <Link to="/book" className="cta-button">
                                <Calendar size={18} />
                                <span>Book Now</span>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isOpen && (
                    <div className="mobile-menu glass-card">
                        <a href="/#hero" onClick={() => setIsOpen(false)}>Home</a>
                        <a href="/#services" onClick={() => setIsOpen(false)}>Services</a>
                        <a href="/#about" onClick={() => setIsOpen(false)}>About Us</a>
                        <Link to="/book" className="mobile-cta" onClick={() => setIsOpen(false)}>
                            Book Service
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    )
}

export default Navbar
