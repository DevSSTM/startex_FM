import { useState, useEffect, useMemo } from 'react'
import { Calendar as CalendarIcon, Clock, Home, CheckCircle, Send, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addHours, parse, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfToday } from 'date-fns'
import './BookingPage.css'

const BookingPage = () => {
    const [step, setStep] = useState(1)
    const [services, setServices] = useState([])
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [existingBookings, setExistingBookings] = useState([])

    const [formData, setFormData] = useState({
        serviceType: '',
        serviceId: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '08:00',
        rooms: 2,
        addons: [],
        name: '',
        phone: '',
        address: '',
        remarks: ''
    })

    const [totalPrice, setTotalPrice] = useState(0)

    const AVAILABLE_ADDONS = [
        { id: 'ac', name: 'AC Cleaning', price: 2500, color: '#2563eb', bg: '#dbeafe' }, // Blue
        { id: 'fridge', name: 'Refrigerator Cleaning', price: 1500, color: '#059669', bg: '#d1fae5' }, // Green
        { id: 'oven', name: 'Oven Deep Clean', price: 1200, color: '#ea580c', bg: '#ffedd5' }, // Orange
        { id: 'window', name: 'Extra Window Cleaning', price: 1000, color: '#7c3aed', bg: '#ede9fe' } // Purple
    ]

    useEffect(() => {
        // Enforce the latest service definitions
        const coreServices = [
            {
                id: 1,
                name: 'Normal Cleaning',
                basePrice: 15000,
                duration: '3 Hours',
                type: 'normal',
                description: 'Target: Daily/weekly apartment upkeep',
                features: [
                    { text: 'Floor sweeping & mopping', included: true },
                    { text: 'Washroom cleaning (toilets, sinks, mirrors, floors)', included: true },
                    { text: 'Dusting surfaces (tables, shelves, counters)', included: true },
                    { text: 'Balcony sweeping & mopping', included: true },
                    { text: 'Cobweb removal', included: true },
                    { text: 'Kitchen countertop & external surface wipe-down', included: true },
                    { text: 'Spot cleaning where required', included: true },
                    { text: 'Deep cleaning of kitchen (appliances external, cabinets external)', included: false },
                    { text: 'Polishing wood surfaces & furniture', included: false },
                    { text: 'Window & glass panel cleaning', included: false },
                    { text: 'Skirting, fans, light fixtures & switchboards detailed cleaning', included: false },
                    { text: 'Vacuuming carpets, sofas, rugs', included: false },
                    { text: 'Hard stain removal (best-effort basis)', included: false }
                ],
            },
            {
                id: 2,
                name: 'Deep Cleaning',
                basePrice: 20000,
                duration: '5 Hours',
                type: 'deep',
                description: 'Target: Weekly, Seasonal, move-in/move-out, post-renovation',
                features: [
                    { text: 'Floor sweeping & mopping', included: true },
                    { text: 'Washroom cleaning (toilets, sinks, mirrors, floors)', included: true },
                    { text: 'Dusting surfaces (tables, shelves, counters)', included: true },
                    { text: 'Balcony sweeping & mopping', included: true },
                    { text: 'Cobweb removal', included: true },
                    { text: 'Kitchen countertop & external surface wipe-down', included: true },
                    { text: 'Spot cleaning where required', included: true },
                    { text: 'Deep cleaning of kitchen (appliances external, cabinets external)', included: true },
                    { text: 'Polishing wood surfaces & furniture', included: true },
                    { text: 'Window & glass panel cleaning', included: true },
                    { text: 'Skirting, fans, light fixtures & switchboards detailed cleaning', included: true },
                    { text: 'Vacuuming carpets, sofas, rugs', included: true },
                    { text: 'Hard stain removal (best-effort basis)', included: true }
                ],
            }
        ]

        setServices(coreServices)
        // Update localStorage

        // Auto-select Normal Cleaning
        setFormData(prev => ({
            ...prev,
            serviceType: 'normal',
            serviceId: 1
        }))
    }, [])

    useEffect(() => {
        // Load existing bookings to check availability
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        setExistingBookings(bookings)
    }, [])

    useEffect(() => {
        const selected = services.find(s => s.id === formData.serviceId)
        if (selected) {
            let price = Number(selected.basePrice)

            // Room surcharge logic
            if (formData.rooms === 3) price += (price * 0.15)
            if (formData.rooms === 4) price += (price * 0.3)

            // Add-ons calculation
            const addonsCost = formData.addons.reduce((acc, addonId) => {
                const addon = AVAILABLE_ADDONS.find(a => a.id === addonId)
                return acc + (addon ? addon.price : 0)
            }, 0)

            setTotalPrice(Math.round(price + addonsCost))
        }
    }, [formData.serviceId, formData.rooms, formData.addons, services])

    // Availability Logic
    const morningSlots = ['07:00', '08:00', '09:00']
    const eveningSlots = ['12:00', '13:00', '14:00']

    // Helper to count bookings per session for a given date
    const getSessionCounts = (dateStr) => {
        const dayBookings = existingBookings.filter(b => b.date === dateStr && b.status !== 'cancelled')

        const morningCount = dayBookings.filter(b => {
            if (!b.startTime) return false
            const hour = parseInt(b.startTime.split(':')[0])
            return hour < 12 // Before 12:00 is Morning
        }).length

        const eveningCount = dayBookings.filter(b => {
            if (!b.startTime) return false
            const hour = parseInt(b.startTime.split(':')[0])
            return hour >= 12 // 12:00 and after is Evening
        }).length

        return { morningCount, eveningCount }
    }

    const checkSlotAvailability = (time) => {
        const { morningCount, eveningCount } = getSessionCounts(formData.date)
        const hour = parseInt(time.split(':')[0])
        const isMorning = hour < 12

        // Session-based availability: Max 2 bookings per session
        // Note: We allow overlapping times (e.g. two people can book 8:00)
        // The constraint is purely on the total count for the session.
        if (isMorning) {
            return morningCount < 2
        } else {
            return eveningCount < 2
        }
    }

    // Calendar Generation
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    const handleDateClick = (day) => {
        if (isBefore(day, startOfToday())) return
        setFormData({ ...formData, date: format(day, 'yyyy-MM-dd') })
    }

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const handleNext = () => setStep(step + 1)
    const handleBack = () => setStep(step - 1)

    const toggleAddon = (id) => {
        setFormData(prev => {
            if (prev.addons.includes(id)) {
                return { ...prev, addons: prev.addons.filter(a => a !== id) }
            } else {
                return { ...prev, addons: [...prev.addons, id] }
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const selected = services.find(s => s.id === formData.serviceId)
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        const durationHours = parseInt(selected.duration) || 3

        // Generate ID: Start from 1, or increment max existing ID (ignoring timestamps)
        const existingIds = bookings.map(b => b.id).filter(id => id < 900000) // Filter out timestamp IDs
        const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1

        const newBooking = {
            ...formData,
            serviceType: selected.name,
            addons: formData.addons.map(id => AVAILABLE_ADDONS.find(a => a.id === id)?.name).join(', '),
            id: nextId,
            status: 'pending',
            price: totalPrice,
            endTime: format(addHours(parse(formData.startTime, 'HH:mm', new Date()), durationHours), 'HH:mm'),
            createdAt: new Date().toISOString()
        }
        bookings.push(newBooking)
        localStorage.setItem('bookings', JSON.stringify(bookings))
        setStep(6)
    }

    const sendToWhatsApp = () => {
        const selected = services.find(s => s.id === formData.serviceId)
        const message = `*STRATEX Booking Request*\n\n` +
            `*Service:* ${selected.name}\n` +
            `*Date:* ${formData.date}\n` +
            `*Service:* ${selected.name}\n` +
            `*Date:* ${formData.date}\n` +
            `*Time:* ${formData.startTime}\n` +
            `*Rooms:* ${formData.rooms}\n` +
            `*Add-ons:* ${formData.addons.length > 0 ? formData.addons.map(id => AVAILABLE_ADDONS.find(a => a.id === id)?.name).join(', ') : 'None'}\n` +
            `*Price:* LKR ${totalPrice.toLocaleString()}\n\n` +
            `*Customer:* ${formData.name}\n` +
            `*Phone:* ${formData.phone}\n` +
            `*Address:* ${formData.address}\n` +
            `*Remarks:* ${formData.remarks || 'None'}`

        const encoded = encodeURIComponent(message)
        window.open(`https://wa.me/94771234567?text=${encoded}`, '_blank')
    }

    return (
        <div className="booking-page">
            <div className="booking-container">
                <div className="booking-header">
                    <h1>Book Your Service</h1>
                    <p>Professional Cleaning at Your Doorstep</p>
                </div>

                <div className="progress-bar no-print">
                    {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`step ${step >= s ? 'active' : ''}`}>{s}</div>
                    ))}
                </div>

                <div className="form-card">
                    {/* Step 1: Service Selection */}
                    {step === 1 && (
                        <div className="step-content">
                            <h3>Select Service Type</h3>
                            <div className="service-options">
                                {services.map(service => (
                                    <div
                                        key={service.id}
                                        className={`option-card ${formData.serviceId === service.id ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, serviceId: service.id, serviceType: service.name.toLowerCase() })}
                                    >
                                        {service.type === 'deep' ? <Sparkles size={32} /> : <Home size={32} />}
                                        <h4>{service.name}</h4>
                                        <p>{service.description || 'Professional Cleaning'}</p>
                                        {service.features && (
                                            <ul className="card-features">
                                                {service.features.map((item, i) => (
                                                    <li key={i} className={item.included ? 'included' : 'excluded'}>
                                                        {item.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <span>Approx {service.duration}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary" onClick={handleNext}>Next Step</button>
                        </div>
                    )}

                    {/* Step 2: Property Details */}
                    {step === 2 && (
                        <div className="step-content">
                            <h3>Property Details</h3>
                            <div className="input-group">
                                <label>Number of Bedrooms</label>
                                <div className="room-selector">
                                    {[2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            className={formData.rooms === num ? 'selected' : ''}
                                            onClick={() => setFormData({ ...formData, rooms: num })}
                                        >
                                            {num} Rooms
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="price-preview">
                                <span>Estimated Price:</span>
                                <h2>LKR {totalPrice.toLocaleString()}</h2>
                            </div>
                            <div className="actions">
                                <button className="btn-secondary" onClick={handleBack}>Back</button>
                                <button className="btn-primary" onClick={handleNext}>Next Step</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Add-ons */}
                    {step === 3 && (
                        <div className="step-content">
                            <h3>Select Add-ons</h3>
                            <div className="addons-grid">
                                {AVAILABLE_ADDONS.map(addon => {
                                    const isSelected = formData.addons.includes(addon.id)
                                    return (
                                        <div
                                            key={addon.id}
                                            className={`addon-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => toggleAddon(addon.id)}
                                            style={{
                                                borderColor: isSelected ? addon.color : 'transparent',
                                                backgroundColor: addon.bg, // Always show the color
                                                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                                            }}
                                        >
                                            <div className="addon-info">
                                                <h4 style={{ color: '#1e293b' }}>{addon.name}</h4>
                                                <span style={{
                                                    color: addon.color,
                                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                                    border: '1px solid rgba(0,0,0,0.05)'
                                                }}>
                                                    LKR {addon.price}
                                                </span>
                                            </div>
                                            <div
                                                className={`checkbox ${isSelected ? 'checked' : ''}`}
                                                style={{
                                                    borderColor: addon.color,
                                                    backgroundColor: isSelected ? addon.color : 'white',
                                                    color: 'white'
                                                }}
                                            >
                                                {isSelected && <CheckCircle size={20} />}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="price-summary-small">
                                <span>Total Price:</span>
                                <h2>LKR {totalPrice.toLocaleString()}</h2>
                            </div>
                            <div className="actions">
                                <button className="btn-secondary" onClick={handleBack}>Back</button>
                                <button className="btn-primary" onClick={handleNext}>Next Step</button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Schedule */}
                    {step === 4 && (
                        <div className="step-content scheduler-step">
                            <h3>Schedule Date & Time</h3>
                            <div className="scheduler-grid">
                                <div className="scheduler-left">
                                    <div className="input-group">
                                        <label><CalendarIcon size={18} /> Selected Date</label>
                                        <div className="selected-date-display">
                                            {format(parse(formData.date, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy')}
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label><Clock size={18} /> Morning Session</label>
                                        <div className="time-slots-grid">
                                            {morningSlots.map(time => {
                                                const isAvailable = checkSlotAvailability(time)
                                                return (
                                                    <button
                                                        key={time}
                                                        className={`slot-btn ${formData.startTime === time ? 'selected' : ''} ${!isAvailable ? 'occupied' : ''}`}
                                                        disabled={!isAvailable}
                                                        onClick={() => setFormData({ ...formData, startTime: time })}
                                                    >
                                                        {time}
                                                        {!isAvailable && <span className="occupied-badge">Booked</span>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label><Clock size={18} /> Evening Session</label>
                                        <div className="time-slots-grid">
                                            {eveningSlots.map(time => {
                                                const isAvailable = checkSlotAvailability(time)
                                                return (
                                                    <button
                                                        key={time}
                                                        className={`slot-btn ${formData.startTime === time ? 'selected' : ''} ${!isAvailable ? 'occupied' : ''}`}
                                                        disabled={!isAvailable}
                                                        onClick={() => setFormData({ ...formData, startTime: time })}
                                                    >
                                                        {time}
                                                        {!isAvailable && <span className="occupied-badge">Booked</span>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="scheduler-right">
                                    <div className="custom-calendar shadow-premium">
                                        <div className="calendar-header">
                                            <button onClick={prevMonth}><ChevronLeft size={20} /></button>
                                            <h4>{format(currentMonth, 'MMMM yyyy')}</h4>
                                            <button onClick={nextMonth}><ChevronRight size={20} /></button>
                                        </div>
                                        <div className="calendar-weekdays">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}
                                        </div>
                                        <div className="calendar-grid">
                                            {calendarDays.map((day, i) => {
                                                const dateStr = format(day, 'yyyy-MM-dd')
                                                const isSelected = isSameDay(day, parse(formData.date, 'yyyy-MM-dd', new Date()))
                                                const isCurrentMonth = isSameMonth(day, monthStart)
                                                const isPast = isBefore(day, startOfToday())
                                                const { morningCount, eveningCount } = getSessionCounts(dateStr)
                                                const isBusy = morningCount >= 2 && eveningCount >= 2 // Full day booked only if BOTH sessions are full

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`calendar-day ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${isPast ? 'past' : ''} ${isBusy ? 'busy' : ''}`}
                                                        onClick={() => handleDateClick(day)}
                                                    >
                                                        <span className="day-number">{format(day, 'd')}</span>
                                                        {(morningCount + eveningCount) > 0 && !isPast && (
                                                            <div className="dots">
                                                                {/* Show dots based on total bookings, capped at 3 for UI */}
                                                                {Array(Math.min(morningCount + eveningCount, 3)).fill(0).map((_, idx) => <span key={idx} className="dot"></span>)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="calendar-legend">
                                        <div className="legend-item"><span className="dot busy"></span> Busy</div>
                                        <div className="legend-item"><span className="dot available"></span> Available</div>
                                    </div>
                                </div>
                            </div>
                            <div className="actions">
                                <button className="btn-secondary" onClick={handleBack}>Back</button>
                                <button className="btn-primary" onClick={handleNext} disabled={!checkSlotAvailability(formData.startTime)}>
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Contact Details */}
                    {step === 5 && (
                        <form onSubmit={handleSubmit} className="step-content">
                            <h3>Contact Details</h3>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <textarea
                                    placeholder="Service Address"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="input-group">
                                <textarea
                                    placeholder="Special Remarks (Optional)"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="actions">
                                <button className="btn-secondary" onClick={handleBack} type="button">Back</button>
                                <button className="btn-primary" type="submit">Confirm Booking</button>
                            </div>
                        </form>
                    )}

                    {/* Step 6: Confirmation */}
                    {step === 6 && (
                        <div className="step-content success">
                            <div className="success-icon">
                                <CheckCircle size={64} />
                            </div>
                            <h3>Booking Confirmed!</h3>
                            <p>Thank you for choosing STRATEX. Our team will contact you shortly.</p>
                            <button className="btn-whatsapp" onClick={sendToWhatsApp}>
                                <Send size={18} /> Message on WhatsApp
                            </button>
                            <button className="btn-text" onClick={() => window.location.href = '/'}>
                                Back to Home
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BookingPage
