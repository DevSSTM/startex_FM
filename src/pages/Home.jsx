import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Sparkles, Clock, Star, Check } from 'lucide-react'
import './Home.css'

const Home = () => {
    const [services, setServices] = useState([])

    useEffect(() => {
        const savedServices = JSON.parse(localStorage.getItem('services'))
        if (savedServices && savedServices.length > 0) {
            setServices(savedServices)
        } else {
            // Default services if storage is empty
            const defaults = [
                {
                    id: 1,
                    name: 'Normal Cleaning',
                    basePrice: 15000,
                    description: 'Daily/Weekly upkeep for a clean environment.',
                    features: ['Floor Sweeping & Mopping', 'Washroom Sanitation', 'Surface Dusting', 'Kitchen Countertop Cleaning'],
                    type: 'normal'
                },
                {
                    id: 2,
                    name: 'Deep Cleaning',
                    basePrice: 20000,
                    description: 'Detailed & thorough seasonal restoration.',
                    features: ['Includes Normal Cleaning', 'Window & Glass Cleaning', 'Vacuuming Carpets & Sofas', 'Hard Stain Removal'],
                    type: 'deep',
                    featured: true
                }
            ]
            setServices(defaults)
        }
    }, [])

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section id="hero" className="hero">
                <div className="hero-content">
                    <span className="badge">Premium Cleaning Services</span>
                    <h1>Strategizing Facility <span>Excellence</span></h1>
                    <p>
                        Experience the gold standard in mobile cleaning. From daily upkeep to
                        deep seasonal restoration, we bring professional excellence to your home.
                    </p>
                    <div className="hero-actions">
                        <Link to="/book" className="btn-primary">
                            Book a Cleaning <ArrowRight size={20} />
                        </Link>
                        <a href="#services" className="btn-secondary">Explore Services</a>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="image-overlay"></div>
                    <img src="/logo/logo.png" alt="Stratex Logo" className="floating-logo" />
                </div>
            </section>

            {/* Features/About Section */}
            <section id="about" className="features">
                <div className="feature-card">
                    <Shield className="icon" />
                    <h3>Trusted Professionals</h3>
                    <p>All our cleaners are vetted and trained for maximum security.</p>
                </div>
                <div className="feature-card">
                    <Sparkles className="icon" />
                    <h3>Deep Cleaning</h3>
                    <p>We go beyond the surface to ensure a germ-free environment.</p>
                </div>
                <div className="feature-card">
                    <Clock className="icon" />
                    <h3>On-Time Service</h3>
                    <p>Your time is valuable. We guarantee punctuality for every slot.</p>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="services-overview">
                <div className="section-title">
                    <h2>Our Core Packages</h2>
                    <p>Tailored solutions for every need</p>
                </div>
                <div className="services-grid">
                    {services.map((service) => (
                        <div key={service.id} className={`service-card ${service.featured ? 'featured' : ''}`}>
                            {service.featured && <div className="popular-badge">Most Popular</div>}
                            <h3>{service.name}</h3>
                            <p className="service-desc">{service.description}</p>
                            <ul className="service-list">
                                {service.features ? (
                                    service.features.map((feat, i) => (
                                        <li key={i}><Check size={14} /> {feat}</li>
                                    ))
                                ) : (
                                    <>
                                        <li><Check size={14} /> Professional Staff</li>
                                        <li><Check size={14} /> Quality Equipment</li>
                                        <li><Check size={14} /> Eco-friendly chemicals</li>
                                    </>
                                )}
                            </ul>
                            <div className="service-footer">
                                <span>Starts at</span>
                                <h4>LKR {Number(service.basePrice).toLocaleString()}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta-content">
                    <h2>Ready for a Spotless Home?</h2>
                    <p>Book your preferred date and time in just a few clicks.</p>
                    <Link to="/book" className="btn-white">Schedule Now</Link>
                </div>
            </section>
        </div>
    )
}

export default Home
