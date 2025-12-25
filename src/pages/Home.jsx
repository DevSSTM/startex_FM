import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Sparkles, Clock, Star, Check, Home as HomeIcon } from 'lucide-react'
import './Home.css'

const Home = () => {
    const [services, setServices] = useState([])

    useEffect(() => {
        // Enforce the latest service definitions
        const allTasks = [
            { text: 'Floor sweeping & mopping' },
            { text: 'Washroom cleaning (toilets, sinks, mirrors, floors)' },
            { text: 'Dusting surfaces (tables, shelves, counters)' },
            { text: 'Balcony sweeping & mopping' },
            { text: 'Cobweb removal' },
            { text: 'Kitchen countertop & external surface wipe-down' },
            { text: 'Spot cleaning where required' },
            { text: 'Deep cleaning of kitchen (appliances external, cabinets external)' },
            { text: 'Polishing wood surfaces & furniture' },
            { text: 'Window & glass panel cleaning' },
            { text: 'Skirting, fans, light fixtures & switchboards detailed cleaning' },
            { text: 'Vacuuming carpets, sofas, rugs' },
            { text: 'Hard stain removal (best-effort basis)' }
        ]

        const coreServices = [
            {
                id: 1,
                name: 'Normal Cleaning',
                basePrice: 15000,
                type: 'normal',
                features: allTasks.map((t, idx) => ({
                    ...t,
                    included: idx < 7,
                    isExtra: false
                })),
            },
            {
                id: 2,
                name: 'Deep Cleaning',
                basePrice: 20000,
                type: 'deep',
                featured: true,
                features: allTasks.map((t, idx) => ({
                    ...t,
                    included: true,
                    isExtra: idx >= 7
                })),
            }
        ]

        setServices(coreServices)
        // Update local storage to reflect these changes if we want to persist custom edits later,
        // but for now, we want to force this "Golden Source" of truth.
        localStorage.setItem('services', JSON.stringify(coreServices))
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
            <section id="about" className="section-padding features-section">
                <div className="container">
                    <div className="section-title-dark">
                        <span className="badge">Why Choose Us</span>
                        <h2>Experts in <span>Modern Cleaning</span></h2>
                        <p>We combine professional skills with eco-friendly solutions to deliver unmatched results.</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <Shield className="icon" />
                            <h3>Trusted Professionals</h3>
                            <p>All our cleaners are vetted and trained for maximum security and peace of mind.</p>
                        </div>
                        <div className="feature-card">
                            <Sparkles className="icon" />
                            <h3>Deep Cleaning</h3>
                            <p>We go beyond the surface to ensure a germ-free and sparkling environment.</p>
                        </div>
                        <div className="feature-card">
                            <Clock className="icon" />
                            <h3>On-Time Service</h3>
                            <p>Your time is valuable. We guarantee punctuality and efficiency for every single slot.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="services-overview">
                <div className="container">
                    <div className="section-title">
                        <h2>Our Core Packages</h2>
                        <p>Tailored cleaning solutions for your home and lifestyle.</p>
                    </div>
                    <div className="services-grid">
                        {services.map((service) => (
                            <div key={service.id} className={`service-card ${service.featured ? 'featured' : ''}`}>
                                <div className="card-top">
                                    {service.type === 'deep' ? <Sparkles size={32} className="card-icon" /> : <HomeIcon size={32} className="card-icon" />}
                                    <h3>{service.name}</h3>
                                </div>
                                <ul className="service-list tick-list">
                                    {service.features?.map((feat, i) => (
                                        <li key={i} className={`${feat.included ? 'included' : 'excluded'} ${feat.isExtra ? 'is-extra' : 'is-normal'}`}>
                                            <span className="tick-box">{feat.included ? '✓' : '✕'}</span>
                                            {feat.text}
                                        </li>
                                    ))}
                                </ul>
                                <div className="service-footer">
                                    <div className="price-tag">
                                        <span>Starts at</span>
                                        <h4>LKR {Number(service.basePrice).toLocaleString()}</h4>
                                    </div>
                                    <Link to="/book" className="btn-book-now">
                                        Schedule Now <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section section-padding">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready for a Spotless Home?</h2>
                        <p>Join hundreds of happy customers. Book your cleaning slot in just under 2 minutes.</p>
                        <Link to="/book" className="btn-white">Schedule Your Visit</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
