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
        preferredTime: '',
        remarks: ''
    })

    const [totalPrice, setTotalPrice] = useState(0)

    const AVAILABLE_ADDONS = [
        { id: 'floor', name: 'Floor buffing', price: 3000, color: '#ea580c', bg: '#fff7ed' },
        { id: 'carpet', name: 'Carpet Shampooing', price: 3000, color: '#7c3aed', bg: '#f5f3ff' },
        { id: 'ac', name: 'AC Cleaning', price: 2500, color: '#2563eb', bg: '#dbeafe' },
        { id: 'fridge', name: 'Refrigerator Cleaning', price: 1500, color: '#059669', bg: '#d1fae5' }
    ]

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
                    included: idx < 7
                })),
            },
            {
                id: 2,
                name: 'Deep Cleaning',
                basePrice: 20000,
                type: 'deep',
                features: allTasks.map((t, idx) => ({
                    ...t,
                    included: true
                })),
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
    const afternoonSlots = ['10:00', '11:00', '12:00']
    const eveningSlots = ['13:00', '14:00', '15:00']

    // Helper to count bookings per session for a given date
    const getSessionCounts = (dateStr) => {
        const dayBookings = existingBookings.filter(b => b.date === dateStr && b.status !== 'cancelled')

        const morningCount = dayBookings.filter(b => {
            if (!b.startTime) return false
            const hour = parseInt(b.startTime.split(':')[0])
            return hour >= 7 && hour < 10
        }).length

        const afternoonCount = dayBookings.filter(b => {
            if (!b.startTime) return false
            const hour = parseInt(b.startTime.split(':')[0])
            return hour >= 10 && hour < 13
        }).length

        const eveningCount = dayBookings.filter(b => {
            if (!b.startTime) return false
            const hour = parseInt(b.startTime.split(':')[0])
            return hour >= 13
        }).length

        return { morningCount, afternoonCount, eveningCount }
    }



    const checkSlotAvailability = (time) => {
        const { morningCount, afternoonCount, eveningCount } = getSessionCounts(formData.date)
        const hour = parseInt(time.split(':')[0])

        // Morning (7-9)
        if (hour >= 7 && hour < 10) {
            return morningCount < 2
        }
        // Afternoon (10-12)
        else if (hour >= 10 && hour < 13) {
            return afternoonCount < 2 && morningCount < 2
        }
        // Evening (13+)
        else {
            const dayOfWeek = parse(formData.date, 'yyyy-MM-dd', new Date()).getDay()
            if (dayOfWeek === 6) return false // Saturday evening blocked
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

        const dayOfWeek = day.getDay()
        if (dayOfWeek === 0) {
            alert("Sundays - No bookings allowed.")
            return
        }

        const dateStr = format(day, 'MM-dd')
        const publicHolidays = ['01-01', '01-14', '02-04', '04-13', '04-14', '05-01', '12-25']
        if (publicHolidays.includes(dateStr)) {
            alert("Public Holiday - No bookings allowed.")
            return
        }

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

        const selectedAddons = formData.addons.map(id => AVAILABLE_ADDONS.find(a => a.id === id)).filter(Boolean)
        const addonsCost = selectedAddons.reduce((acc, a) => acc + a.price, 0)
        const baseAndRoomsPrice = totalPrice - addonsCost

        const newBooking = {
            ...formData,
            serviceType: selected.name,
            addons: selectedAddons.map(a => a.name).join(', '),
            addonDetails: selectedAddons, // Array of {name, price}
            baseAndRoomsPrice: baseAndRoomsPrice,
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
            `*Preferred Time:* ${formData.preferredTime || 'Standard Slot'}\n` +
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
                                        <div className="card-header-main">
                                            {service.type === 'deep' ? <Sparkles size={32} className="card-icon" /> : <Home size={32} className="card-icon" />}
                                            <h4>{service.name}</h4>
                                        </div>
                                        {service.features && (
                                            <ul className="card-features tick-points">
                                                {service.features.map((item, i) => (
                                                    <li key={i} className={`tick-item ${!item.included ? 'excluded' : ''}`}>
                                                        <span className="tick-icon">
                                                            {item.included ? '✓' : '✕'}
                                                        </span>
                                                        {item.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <button
                                            className="btn-primary card-select-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData({ ...formData, serviceId: service.id, serviceType: service.name.toLowerCase() });
                                                handleNext();
                                            }}
                                        >
                                            Next Step
                                        </button>
                                    </div>
                                ))}
                            </div>
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
                                <span>Price:</span>
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
                            <div className="scheduler-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                {/* 1. Calendar Top */}
                                <div className="calendar-section" style={{ width: '100%' }}>
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
                                                const dayOfWeek = day.getDay()
                                                const isSunday = dayOfWeek === 0
                                                const counts = getSessionCounts(dateStr)
                                                const isBusy = (counts.morningCount + counts.afternoonCount >= 2) && (counts.eveningCount >= 2)
                                                const totalBookings = counts.morningCount + counts.afternoonCount + counts.eveningCount

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`calendar-day ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${isPast ? 'past' : ''} ${isBusy ? 'busy' : ''} ${isSunday ? 'sunday' : ''}`}
                                                        onClick={() => !isBusy && handleDateClick(day)}
                                                    >
                                                        <span className="day-number">{format(day, 'd')}</span>
                                                        {totalBookings > 0 && !isPast && (
                                                            <div className="dots">
                                                                {Array(Math.min(totalBookings, 3)).fill(0).map((_, idx) => <span key={idx} className="dot"></span>)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="calendar-legend" style={{ marginTop: '10px', justifyContent: 'center' }}>
                                        <div className="legend-item"><span className="dot busy"></span> Busy</div>
                                        <div className="legend-item"><span className="dot available"></span> Available</div>
                                    </div>
                                </div>

                                {/* 2. Selected Date Display */}
                                <div className="date-display-section" style={{ padding: '0 10px' }}>
                                    <div className="input-group">
                                        <label><CalendarIcon size={18} /> Selected Date</label>
                                        <div className="selected-date-display" style={{ textAlign: 'center', background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                                            {format(parse(formData.date, 'yyyy-MM-dd', new Date()), 'MMMM do, yyyy')}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Time Slots */}
                                <div className="time-slots-section" style={{ padding: '0 10px' }}>
                                    {/* Morning */}
                                    <div className="input-group">
                                        <label><Clock size={18} /> Morning Session</label>
                                        <div className="time-slots-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
                                            {morningSlots.map(time => {
                                                const isAvailable = checkSlotAvailability(time)
                                                return (
                                                    <button
                                                        key={time}
                                                        className={`slot-btn ${formData.startTime === time ? 'selected' : ''} ${!isAvailable ? 'occupied' : ''}`}
                                                        disabled={!isAvailable}
                                                        onClick={() => setFormData({ ...formData, startTime: time })}
                                                    >
                                                        {time} - {parseInt(time.split(':')[0])}:30
                                                        {!isAvailable && <span className="occupied-badge">Booked</span>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Afternoon - Hidden if Morning is full (2 bookings) */}
                                    {getSessionCounts(formData.date).morningCount < 2 && (
                                        <div className="input-group" style={{ marginTop: '20px' }}>
                                            <label><Clock size={18} /> Afternoon Session</label>
                                            <div className="time-slots-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
                                                {afternoonSlots.map(time => {
                                                    const isAvailable = checkSlotAvailability(time)
                                                    return (
                                                        <button
                                                            key={time}
                                                            className={`slot-btn ${formData.startTime === time ? 'selected' : ''} ${!isAvailable ? 'occupied' : ''}`}
                                                            disabled={!isAvailable}
                                                            onClick={() => setFormData({ ...formData, startTime: time })}
                                                        >
                                                            {time} - {parseInt(time.split(':')[0])}:30
                                                            {!isAvailable && <span className="occupied-badge">Booked</span>}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Evening */}
                                    <div className="input-group" style={{ marginTop: '20px' }}>
                                        <label><Clock size={18} /> Evening Session</label>
                                        <div className="time-slots-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
                                            {eveningSlots.map(time => {
                                                const isAvailable = checkSlotAvailability(time)
                                                const dayOfWeek = parse(formData.date, 'yyyy-MM-dd', new Date()).getDay()
                                                const isSaturdayHoliday = dayOfWeek === 6

                                                return (
                                                    <button
                                                        key={time}
                                                        className={`slot-btn ${formData.startTime === time ? 'selected' : ''} ${!isAvailable || isSaturdayHoliday ? 'occupied' : ''}`}
                                                        disabled={!isAvailable || isSaturdayHoliday}
                                                        onClick={() => setFormData({ ...formData, startTime: time })}
                                                    >
                                                        {parseInt(time.split(':')[0]) - 12}:00 - {parseInt(time.split(':')[0]) - 12}:30 PM
                                                        {isSaturdayHoliday ? (
                                                            <span className="occupied-badge" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>Holiday</span>
                                                        ) : (
                                                            !isAvailable && <span className="occupied-badge">Booked</span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
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
                                    style={{ fontFamily: 'inherit' }}
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="tel"
                                    placeholder="Phone Number (WhatsApp preferred)"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ fontFamily: 'inherit' }}
                                />
                            </div>
                            <div className="input-group">
                                <textarea
                                    placeholder="Service Address"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    style={{ fontFamily: 'inherit' }}
                                ></textarea>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Preferred Time"
                                    value={formData.preferredTime}
                                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                    style={{ fontFamily: 'inherit' }}
                                />
                            </div>
                            <div className="input-group">
                                <textarea
                                    placeholder="Special Remarks (Optional)"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    style={{ fontFamily: 'inherit' }}
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
