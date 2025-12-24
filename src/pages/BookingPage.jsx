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
        name: '',
        phone: '',
        address: '',
        remarks: ''
    })

    const [totalPrice, setTotalPrice] = useState(0)

    useEffect(() => {
        // Load services
        const savedServices = JSON.parse(localStorage.getItem('services'))
        if (savedServices) {
            setServices(savedServices)
            if (savedServices.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    serviceType: savedServices[0].name.toLowerCase(),
                    serviceId: savedServices[0].id
                }))
            }
        } else {
            const defaults = [
                { id: 1, name: 'Normal Cleaning', basePrice: 15000, duration: '3 Hours', type: 'normal' },
                { id: 2, name: 'Deep Cleaning', basePrice: 20000, duration: '5 Hours', type: 'deep' }
            ]
            setServices(defaults)
            setFormData(prev => ({ ...prev, serviceType: 'normal', serviceId: 1 }))
        }

        // Load existing bookings to check availability
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        setExistingBookings(bookings)
    }, [])

    useEffect(() => {
        const selected = services.find(s => s.id === formData.serviceId)
        if (selected) {
            let price = Number(selected.basePrice)
            if (formData.rooms === 3) price += (price * 0.15)
            if (formData.rooms === 4) price += (price * 0.3)
            setTotalPrice(Math.round(price))
        }
    }, [formData.serviceId, formData.rooms, services])

    // Availability Logic
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

    const getOccupiedSlots = (date) => {
        return existingBookings
            .filter(b => b.date === date && b.status !== 'cancelled')
            .map(b => b.startTime)
    }

    const occupiedSlots = useMemo(() => getOccupiedSlots(formData.date), [formData.date, existingBookings])

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

    const handleSubmit = (e) => {
        e.preventDefault()
        const selected = services.find(s => s.id === formData.serviceId)
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        const durationHours = parseInt(selected.duration) || 3

        const newBooking = {
            ...formData,
            serviceType: selected.name,
            id: Date.now(),
            status: 'pending',
            price: totalPrice,
            endTime: format(addHours(parse(formData.startTime, 'HH:mm', new Date()), durationHours), 'HH:mm'),
            createdAt: new Date().toISOString()
        }
        bookings.push(newBooking)
        localStorage.setItem('bookings', JSON.stringify(bookings))
        setStep(5)
    }

    const sendToWhatsApp = () => {
        const selected = services.find(s => s.id === formData.serviceId)
        const message = `*STRATEX Booking Request*\n\n` +
            `*Service:* ${selected.name}\n` +
            `*Date:* ${formData.date}\n` +
            `*Time:* ${formData.startTime}\n` +
            `*Rooms:* ${formData.rooms}\n` +
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
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`step ${step >= s ? 'active' : ''}`}>{s}</div>
                    ))}
                </div>

                <div className="form-card">
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
                                        <span>Approx {service.duration}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary" onClick={handleNext}>Next Step</button>
                        </div>
                    )}

                    {step === 2 && (
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
                                        <label><Clock size={18} /> Available Time Slots</label>
                                        <div className="time-slots-grid">
                                            {timeSlots.map(time => {
                                                const isOccupied = occupiedSlots.includes(time)
                                                return (
                                                    <button
                                                        key={time}
                                                        className={`slot-btn ${formData.startTime === time ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                                                        disabled={isOccupied}
                                                        onClick={() => setFormData({ ...formData, startTime: time })}
                                                    >
                                                        {time}
                                                        {isOccupied && <span className="occupied-badge">Booked</span>}
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
                                                const dayBookings = existingBookings.filter(b => b.date === dateStr && b.status !== 'cancelled')
                                                const isBusy = dayBookings.length >= 5

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`calendar-day ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${isPast ? 'past' : ''} ${isBusy ? 'busy' : ''}`}
                                                        onClick={() => handleDateClick(day)}
                                                    >
                                                        <span className="day-number">{format(day, 'd')}</span>
                                                        {dayBookings.length > 0 && !isPast && (
                                                            <div className="dots">
                                                                {dayBookings.slice(0, 3).map((_, idx) => <span key={idx} className="dot"></span>)}
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
                                <button className="btn-primary" onClick={handleNext} disabled={occupiedSlots.includes(formData.startTime)}>
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
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

                    {step === 4 && (
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

                    {step === 5 && (
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
