import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Sparkles, Clock, Star, Check } from 'lucide-react'
import './Home.css'

const Home = () => {
    const [services, setServices] = useState([])

    useEffect(() => {
        // Enforce the latest service definitions
        const coreServices = [
            {
                id: 1,
                name: 'Normal Cleaning',
                basePrice: 15000,
                description: 'Target: Daily/weekly apartment upkeep',
                features: [
                    'Floor sweeping & mopping',
                    'Washroom cleaning (toilets, sinks, mirrors, floors)',
                    'Dusting surfaces (tables, shelves, counters)',
                    'Balcony sweeping & mopping',
                    'Cobweb removal',
                    'Kitchen countertop & external surface wipe-down',
                    'Spot cleaning where required'
                ],
                type: 'normal'
            },
            {
                id: 2,
                name: 'Deep Cleaning',
                basePrice: 20000,
                description: 'Target: Weekly, Seasonal, move-in/move-out, post-renovation',
                features: [
                    'All tasks from Normal Cleaning PLUS:',
                    'Deep cleaning of kitchen (appliances external, cabinets external)',
                    'Polishing wood surfaces & furniture',
                    'Window & glass panel cleaning',
                    'Skirting, fans, light fixtures & switchboards detailed cleaning',
                    'Vacuuming carpets, sofas, rugs',
                    'Hard stain removal (best-effort basis)'
                ],
                type: 'deep',
                featured: true
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
                            {/* Target description removed as requested */}
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
