import { useState, useEffect, useRef } from 'react'
import {
    Users,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Settings,
    MoreVertical,
    Plus,
    Sparkles,
    LogOut,
    Lock,
    User,
    ChevronRight,
    Search,
    Calendar,
    LayoutDashboard,
    FileText,
    Printer,
    Download,
    Trash2,
    Edit,
    Camera,
    PrinterIcon,
    X,
    RotateCcw,
    Eye,
    Briefcase,
    UserPlus,
    UserCheck,
    MapPin,
    Phone
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const [bookings, setBookings] = useState([])
    const [services, setServices] = useState([])
    const [stats, setStats] = useState({
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
    })
    const [activeTab, setActiveTab] = useState('bookings')
    const [searchTerm, setSearchTerm] = useState('')

    // Modal states
    const [showInvoice, setShowInvoice] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [showViewModal, setShowViewModal] = useState(false)
    const [viewBooking, setViewBooking] = useState(null)
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [editingService, setEditingService] = useState(null)
    const [serviceFormData, setServiceFormData] = useState({
        name: '',
        basePrice: '',
        description: '',
        duration: '',
        rooms: '2+',
        type: 'normal'
    })

    // Vendor State
    const [vendors, setVendors] = useState([])
    const [showVendorModal, setShowVendorModal] = useState(false)
    const [vendorFormData, setVendorFormData] = useState({
        name: '',
        phone: '',
        nic: '',
        address: '',
        specialty: 'General'
    })
    const [showAllocateModal, setShowAllocateModal] = useState(false)
    const [selectedBookingForAlloc, setSelectedBookingForAlloc] = useState(null)

    const invoiceRef = useRef()

    useEffect(() => {
        const authStatus = sessionStorage.getItem('adminAuth')
        if (authStatus === 'true') {
            setIsAuthenticated(true)
        }

        // Initialize Bookings
        const bookingData = JSON.parse(localStorage.getItem('bookings') || '[]')
        setBookings(bookingData.slice().reverse())

        // Initialize Services
        const savedServices = JSON.parse(localStorage.getItem('services'))
        if (!savedServices) {
            const defaultServices = [
                {
                    id: 1,
                    name: 'Normal Cleaning',
                    basePrice: 15000,
                    description: 'Comprehensive residential cleaning for everyday maintenance.',
                    duration: '3-4 Hours',
                    rooms: '2+',
                    type: 'normal'
                },
                {
                    id: 2,
                    name: 'Deep Cleaning',
                    basePrice: 20000,
                    description: 'Intensive cleaning including move-in/move-out and post-construction.',
                    duration: '5-8 Hours',
                    rooms: 'All Areas',
                    type: 'deep'
                }
            ]
            localStorage.setItem('services', JSON.stringify(defaultServices))
            setServices(defaultServices)
        } else {
            setServices(savedServices)
        }

        // Stats calculation
        const newStats = bookingData.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1
            return acc
        }, { pending: 0, confirmed: 0, completed: 0, cancelled: 0 })
        setStats(newStats)
    }, [])

    const handleLogin = (e) => {
        e.preventDefault()
        if (username === 'admin' && password === 'admin123') {
            setIsAuthenticated(true)
            sessionStorage.setItem('adminAuth', 'true')
            setError('')
        } else {
            setError('Invalid username or password')
        }
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
        sessionStorage.removeItem('adminAuth')
    }

    const updateStatus = (id, newStatus) => {
        const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b)
        const updatedOrdered = [...updated].reverse() // Restore original order for storage
        setBookings(updated)
        localStorage.setItem('bookings', JSON.stringify(updatedOrdered))

        const newStats = updated.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1
            return acc
        }, { pending: 0, confirmed: 0, completed: 0, cancelled: 0 })
        setStats(newStats)
    }

    // Service Management
    const handleServiceSubmit = (e) => {
        e.preventDefault()
        let updatedServices
        if (editingService) {
            updatedServices = services.map(s => s.id === editingService.id ? { ...serviceFormData, id: s.id } : s)
        } else {
            const newService = { ...serviceFormData, id: Date.now() }
            updatedServices = [...services, newService]
        }
        setServices(updatedServices)
        localStorage.setItem('services', JSON.stringify(updatedServices))
        setShowServiceModal(false)
        setEditingService(null)
        setServiceFormData({ name: '', basePrice: '', description: '', duration: '', rooms: '2+', type: 'normal' })
    }

    const deleteService = (id) => {
        if (confirm('Are you sure you want to delete this service?')) {
            const updated = services.filter(s => s.id !== id)
            setServices(updated)
            localStorage.setItem('services', JSON.stringify(updated))
        }
    }

    const openEditService = (service) => {
        setEditingService(service)
        setServiceFormData(service)
        setShowServiceModal(true)
    }

    // Invoice
    const handleGenerateInvoice = (booking) => {
        setSelectedBooking(booking)
        setShowInvoice(true)
    }

    const handlePrint = () => {
        window.print()
    }

    const filteredBookings = bookings.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone.includes(searchTerm)
    )

    // Vendor Handlers
    const handleVendorSubmit = (e) => {
        e.preventDefault()
        const newVendor = { ...vendorFormData, id: Date.now(), joinedDate: new Date().toLocaleDateString() }
        const updatedVendors = [...vendors, newVendor]
        setVendors(updatedVendors)
        localStorage.setItem('vendors', JSON.stringify(updatedVendors))
        setShowVendorModal(false)
        setVendorFormData({ name: '', phone: '', nic: '', address: '', specialty: 'General' })
    }

    const deleteVendor = (id) => {
        if (confirm('Remove this vendor?')) {
            const updated = vendors.filter(v => v.id !== id)
            setVendors(updated)
            localStorage.setItem('vendors', JSON.stringify(updated))
        }
    }

    const handleAllocate = (vendorId) => {
        const vendor = vendors.find(v => v.id === vendorId)
        const updatedBookings = bookings.map(b =>
            b.id === selectedBookingForAlloc.id ? { ...b, assignedVendor: vendor.name, vendorId: vendor.id } : b
        )
        // Re-sort to maintain order if needed, or just update
        const updatedOrdered = [...updatedBookings].reverse() // simplistic re-sort if bookings was reversed originally? 
        // Actually bookings state is already reversed in UI but stored usually normal. 
        // Let's just update state and strictly sync.

        // Wait, bookings state is displayed as sliced/reversed. "updated" map is on 'bookings'.
        // Let's just setBookings with the mapped result.
        setBookings(updatedBookings)
        localStorage.setItem('bookings', JSON.stringify(updatedBookings.slice().reverse())) // Assuming storage is chronological

        setShowAllocateModal(false)
        setSelectedBookingForAlloc(null)
    }

    if (!isAuthenticated) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <Lock size={32} />
                        </div>
                        <h1>Admin Portal</h1>
                        <p>Please enter your credentials to continue</p>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label><User size={16} /> Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Lock size={16} /> Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="login-btn">
                            Login Status
                            <ChevronRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar no-print">
                <div className="sidebar-header">
                    <div className="dashboard-logo">
                        <Sparkles size={24} className="sparkle-icon" />
                        <span>STRATEX Admin</span>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    <button
                        className={activeTab === 'bookings' ? 'active' : ''}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={activeTab === 'services' ? 'active' : ''}
                        onClick={() => setActiveTab('services')}
                    >
                        <Settings size={20} />
                        <span>Services</span>
                    </button>
                    <button
                        className={activeTab === 'vendors' ? 'active' : ''}
                        onClick={() => setActiveTab('vendors')}
                    >
                        <Briefcase size={20} />
                        <span>Vendors</span>
                    </button>

                    <div className="sidebar-divider"></div>

                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-top-bar no-print">
                    <div className="page-info">
                        <h1>
                            {activeTab === 'bookings' && 'Bookings Overview'}
                            {activeTab === 'services' && 'Service Management'}
                            {activeTab === 'vendors' && 'Vendor Management'}
                        </h1>
                        <p>Welcome back, Admin</p>
                    </div>

                    {activeTab === 'bookings' && (
                        <div className="search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search customers, services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                </header>

                {activeTab === 'bookings' ? (
                    <div className="dashboard-content no-print">
                        <div className="stats-grid">
                            <div className="stat-card glass-card pending">
                                <div className="stat-icon-wrapper">
                                    <Clock size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Pending</span>
                                    <h3 className="stat-value">{stats.pending}</h3>
                                </div>
                                <div className="stat-trend">Needs Action</div>
                            </div>
                            <div className="stat-card glass-card confirmed">
                                <div className="stat-icon-wrapper">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Confirmed</span>
                                    <h3 className="stat-value">{stats.confirmed}</h3>
                                </div>
                                <div className="stat-trend">Total Active</div>
                            </div>
                            <div className="stat-card glass-card completed">
                                <div className="stat-icon-wrapper">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Completed</span>
                                    <h3 className="stat-value">{stats.completed}</h3>
                                </div>
                                <div className="stat-trend">Success Rate</div>
                            </div>
                            <div className="stat-card glass-card cancelled">
                                <div className="stat-icon-wrapper">
                                    <XCircle size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-label">Cancelled</span>
                                    <h3 className="stat-value">{stats.cancelled}</h3>
                                </div>
                                <div className="stat-trend">Rejected</div>
                            </div>
                        </div>

                        <div className="table-container glass-card">
                            <div className="table-header">
                                <h2>Recent Reservations</h2>
                                <div className="table-actions">
                                    <button className="btn-secondary">Export Data</button>
                                </div>
                            </div>
                            <div className="scrollable-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Customer Details</th>
                                            <th>Value</th>
                                            <th>Allocated Vendor</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookings.map((booking, index) => (
                                            <tr key={booking.id}>
                                                <td className="id-cell">#{booking.id.toString().padStart(3, '0')}</td>
                                                <td>
                                                    <div className="user-info">
                                                        <div className="user-avatar">{booking.name.charAt(0)}</div>
                                                        <div className="user-details">
                                                            <strong>{booking.name}</strong>
                                                            <span>{booking.phone}</span>
                                                            {booking.remarks && (
                                                                <div className="remark-bubble" title={booking.remarks}>
                                                                    <FileText size={12} /> {booking.remarks.substring(0, 20)}{booking.remarks.length > 20 ? '...' : ''}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="price-tag">
                                                        LKR {booking.price.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    {booking.assignedVendor ? (
                                                        <div
                                                            className="vendor-badge"
                                                            onClick={() => { setSelectedBookingForAlloc(booking); setShowAllocateModal(true); }}
                                                            style={{ cursor: 'pointer', paddingRight: '8px' }}
                                                            title="Click to reassign vendor"
                                                        >
                                                            <UserCheck size={14} />
                                                            <span>{booking.assignedVendor}</span>
                                                            <Edit size={12} style={{ marginLeft: '6px', opacity: 0.7 }} />
                                                        </div>
                                                    ) : (
                                                        booking.status !== 'cancelled' && (
                                                            <button className="btn-assign" onClick={() => { setSelectedBookingForAlloc(booking); setShowAllocateModal(true); }}>
                                                                <UserPlus size={14} /> Assign
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${booking.status}`}>
                                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-row">
                                                        <button className="icon-btn view" onClick={() => { setViewBooking(booking); setShowViewModal(true); }} title="View Details">
                                                            <Eye size={18} />
                                                        </button>
                                                        <button className="icon-btn invoice" onClick={() => handleGenerateInvoice(booking)} title="Invoice">
                                                            <FileText size={18} />
                                                        </button>
                                                        {booking.status === 'pending' && (
                                                            <button className="icon-btn confirm" onClick={() => updateStatus(booking.id, 'confirmed')} title="Approve">
                                                                <CheckCircle size={18} />
                                                            </button>
                                                        )}
                                                        {booking.status === 'confirmed' && (
                                                            <button className="icon-btn complete" onClick={() => updateStatus(booking.id, 'completed')} title="Complete">
                                                                <TrendingUp size={18} />
                                                            </button>
                                                        )}
                                                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                            <button className="icon-btn cancel" onClick={() => updateStatus(booking.id, 'cancelled')} title="Reject">
                                                                <XCircle size={18} />
                                                            </button>
                                                        )}
                                                        {(booking.status === 'cancelled' || booking.status === 'completed') && (
                                                            <button className="icon-btn redo" onClick={() => updateStatus(booking.id, 'pending')} title="Redo Order">
                                                                <RotateCcw size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredBookings.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="empty-state">
                                                    <div className="empty-content">
                                                        <Search size={40} />
                                                        <p>No matching reservations found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'services' ? (
                    <div className="services-mgt-container no-print">
                        <div className="section-header">
                            <div className="header-text">
                                <h2>Service Offerings</h2>
                                <p>Manage your professional cleaning packages</p>
                            </div>
                            <button className="btn-primary" onClick={() => { setEditingService(null); setServiceFormData({ name: '', basePrice: '', description: '', duration: '', rooms: '2+', type: 'normal' }); setShowServiceModal(true); }}>
                                <Plus size={18} /> Create New Package
                            </button>
                        </div>

                        <div className="services-grid">
                            {services.map(service => (
                                <div key={service.id} className={`service-mgt-card premium-card ${service.type === 'deep' ? 'featured' : ''}`}>
                                    <div className="card-top">
                                        <div className="service-icon">
                                            {service.type === 'deep' ? <Sparkles size={24} /> : <CheckCircle size={24} />}
                                        </div>
                                        <div className="service-info">
                                            <h4>{service.name}</h4>
                                            <span className="price-label">Starts at LKR {Number(service.basePrice).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <p>{service.description}</p>
                                        <div className="tag-row">
                                            <span className="tag">{service.rooms} Rooms</span>
                                            <span className="tag">{service.duration}</span>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <button className="btn-outline" onClick={() => openEditService(service)}>
                                            <Edit size={16} /> Edit Details
                                        </button>
                                        <button className="btn-icon delete" onClick={() => deleteService(service.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="vendors-container no-print">
                        <div className="section-header">
                            <div className="header-text">
                                <h2>Registered Vendors</h2>
                                <p>Manage your cleaning staff database</p>
                            </div>
                            <button className="btn-primary" onClick={() => setShowVendorModal(true)}>
                                <UserPlus size={18} /> Add Vendor
                            </button>
                        </div>
                        <div className="vendors-grid">
                            {vendors.map(vendor => (
                                <div key={vendor.id} className="vendor-card glass-card">
                                    <div className="vendor-header">
                                        <div className="vendor-avatar">
                                            {vendor.name.charAt(0)}
                                        </div>
                                        <div className="vendor-meta">
                                            <h4>{vendor.name}</h4>
                                            <span className="vendor-nic">NIC: {vendor.nic}</span>
                                        </div>
                                        <button className="icon-btn cancel" onClick={() => deleteVendor(vendor.id)}><Trash2 size={16} /></button>
                                    </div>
                                    <div className="vendor-body">
                                        <div className="v-item"><Phone size={14} /> {vendor.phone}</div>
                                        <div className="v-item"><MapPin size={14} /> {vendor.address}</div>
                                        <div className="v-specialty"><Sparkles size={14} /> {vendor.specialty}</div>
                                    </div>
                                    <div className="vendor-footer">
                                        <span className="v-date">Joined {vendor.joinedDate}</span>
                                    </div>
                                </div>
                            ))}
                            {vendors.length === 0 && (
                                <div className="empty-state">
                                    <p>No vendors registered yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main >

            {/* Service Modal */}
            {
                showServiceModal && (
                    <div className="modal-overlay no-print">
                        <div className="modal-content glass-card service-modal">
                            <div className="modal-header">
                                <h2>{editingService ? 'Edit Package' : 'New Cleaning Package'}</h2>
                                <button className="close-btn" onClick={() => setShowServiceModal(false)}><X /></button>
                            </div>
                            <form onSubmit={handleServiceSubmit} className="service-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Package Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={serviceFormData.name}
                                            onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                                            placeholder="e.g. Eco Cleaning"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Base Price (LKR)</label>
                                        <input
                                            type="number"
                                            required
                                            value={serviceFormData.basePrice}
                                            onChange={(e) => setServiceFormData({ ...serviceFormData, basePrice: e.target.value })}
                                            placeholder="15000"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estimated Duration</label>
                                        <input
                                            type="text"
                                            required
                                            value={serviceFormData.duration}
                                            onChange={(e) => setServiceFormData({ ...serviceFormData, duration: e.target.value })}
                                            placeholder="3-4 Hours"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Room Category</label>
                                        <select
                                            value={serviceFormData.rooms}
                                            onChange={(e) => setServiceFormData({ ...serviceFormData, rooms: e.target.value })}
                                        >
                                            <option value="2+">2+ Rooms</option>
                                            <option value="All Areas">All Areas</option>
                                            <option value="Custom">Custom Scope</option>
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            required
                                            value={serviceFormData.description}
                                            onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                                            placeholder="Describe the inclusions..."
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Visual Style</label>
                                        <div className="radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    checked={serviceFormData.type === 'normal'}
                                                    onChange={() => setServiceFormData({ ...serviceFormData, type: 'normal' })}
                                                /> Normal
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    checked={serviceFormData.type === 'deep'}
                                                    onChange={() => setServiceFormData({ ...serviceFormData, type: 'deep' })}
                                                /> Featured (Premium)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setShowServiceModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">
                                        {editingService ? 'Save Changes' : 'Create Package'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Invoice Modal */}
            {
                showInvoice && selectedBooking && (
                    <div className="invoice-overlay">
                        <div className="invoice-actions no-print">
                            <button className="btn-print" onClick={handlePrint}><Printer size={18} /> Print Bill</button>
                            <button className="btn-close" onClick={() => setShowInvoice(false)}><X size={20} /></button>
                        </div>
                        <div className="invoice-paper" id="invoice-bill">
                            <header className="invoice-header">
                                <div className="invoice-logo">
                                    <Sparkles className="logo-sparkle" />
                                    <div>
                                        <h1>STRATEX</h1>
                                        <span>Strategizing Facility Excellence</span>
                                    </div>
                                </div>
                                <div className="invoice-meta">
                                    <h2>INVOICE</h2>
                                    <p>#INV-{selectedBooking.id.toString().slice(-6)}</p>
                                    <p>Date: {new Date().toLocaleDateString()}</p>
                                </div>
                            </header>

                            <div className="invoice-billing">
                                <div className="bill-to">
                                    <h3>BILL TO</h3>
                                    <strong>{selectedBooking.name}</strong>
                                    <p>{selectedBooking.address}</p>
                                    <p>{selectedBooking.phone}</p>
                                </div>
                                <div className="bill-from">
                                    <h3>FROM</h3>
                                    <strong>STRATEX FACILITY MGT</strong>
                                    <p>123 Clean St, Colombo, SL</p>
                                    <p>+94 11 234 5678</p>
                                </div>
                            </div>

                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th>SERVICE DESCRIPTION</th>
                                        <th>SCHEDULE</th>
                                        <th>ROOMS</th>
                                        <th style={{ textAlign: 'right' }}>AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong>{selectedBooking.serviceType.toUpperCase()} CLEANING</strong>
                                            <p>Professional professional cleaning service</p>
                                        </td>
                                        <td>
                                            {selectedBooking.date}<br />
                                            <small>{selectedBooking.startTime} - {selectedBooking.endTime}</small>
                                        </td>
                                        <td>{selectedBooking.rooms} Rooms</td>
                                        <td style={{ textAlign: 'right' }}>LKR {selectedBooking.price.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="invoice-summary">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>LKR {selectedBooking.price.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax (0%)</span>
                                    <span>LKR 0</span>
                                </div>
                                <div className="summary-row grand-total">
                                    <span>Amount Due</span>
                                    <span>LKR {selectedBooking.price.toLocaleString()}</span>
                                </div>
                            </div>

                            <footer className="invoice-footer">
                                <div className="payment-info">
                                    <h3>PAYMENT METHOD</h3>
                                    <p>Bank Transfer / Cash on Delivery</p>
                                    <p>Bank: HNB | Account: 085020385948</p>
                                </div>
                                <div className="thanks-msg">
                                    <p>Thank you for choosing Stratex!</p>
                                    <div className="stamp">PAID</div>
                                </div>
                            </footer>
                        </div>
                    </div>
                )
            }

            {/* View Details Modal */}
            {
                showViewModal && viewBooking && (
                    <div className="modal-overlay no-print">
                        <div className="modal-content glass-card service-modal">
                            <div className="modal-header">
                                <h2>Booking Details #{viewBooking.id.toString().padStart(3, '0')}</h2>
                                <button className="close-btn" onClick={() => setShowViewModal(false)}><X /></button>
                            </div>
                            <div className="view-details-content">
                                <div className="detail-section">
                                    <h3>Customer Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Name</label>
                                            <p>{viewBooking.name}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Phone</label>
                                            <p>{viewBooking.phone}</p>
                                        </div>
                                        <div className="detail-item full-width">
                                            <label>Address</label>
                                            <p>{viewBooking.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <hr className="divider" />

                                <div className="detail-section">
                                    <h3>Service Order</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Service Type</label>
                                            <p className="highlight">{viewBooking.serviceType}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Date & Time</label>
                                            <p>{viewBooking.date} at {viewBooking.startTime}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Rooms</label>
                                            <p>{viewBooking.rooms}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Duration</label>
                                            <p>Approx {viewBooking.endTime ? `${parseInt(viewBooking.endTime) - parseInt(viewBooking.startTime)} Hours` : 'Standard'}</p>
                                        </div>
                                        <div className="detail-item full-width">
                                            <label>Add-ons</label>
                                            <p>{viewBooking.addons || 'None'}</p>
                                        </div>
                                        <div className="detail-item full-width">
                                            <label>Remarks</label>
                                            <p>{viewBooking.remarks || 'None'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-total">
                                    <span>Total Amount</span>
                                    <h2>LKR {viewBooking.price.toLocaleString()}</h2>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Vendor Modal */}
            {
                showVendorModal && (
                    <div className="modal-overlay no-print">
                        <div className="modal-content glass-card">
                            <div className="modal-header">
                                <h2>Register New Vendor</h2>
                                <button className="close-btn" onClick={() => setShowVendorModal(false)}><X /></button>
                            </div>
                            <form onSubmit={handleVendorSubmit} className="service-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input required type="text" value={vendorFormData.name} onChange={e => setVendorFormData({ ...vendorFormData, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>NIC Number</label>
                                        <input type="text" value={vendorFormData.nic} onChange={e => setVendorFormData({ ...vendorFormData, nic: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input required type="tel" value={vendorFormData.phone} onChange={e => setVendorFormData({ ...vendorFormData, phone: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Specialty</label>
                                        <select value={vendorFormData.specialty} onChange={e => setVendorFormData({ ...vendorFormData, specialty: e.target.value })}>
                                            <option value="General">General Cleaning</option>
                                            <option value="Deep Clean">Deep Cleaning Specialist</option>
                                            <option value="Glass">Glass / Windows</option>
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Address</label>
                                        <textarea value={vendorFormData.address} onChange={e => setVendorFormData({ ...vendorFormData, address: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn-primary">Register Vendor</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Allocate Modal */}
            {
                showAllocateModal && selectedBookingForAlloc && (
                    <div className="modal-overlay no-print">
                        <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h2>Assign Vendor</h2>
                                <button className="close-btn" onClick={() => setShowAllocateModal(false)}><X /></button>
                            </div>
                            <div className="allocate-list">
                                <p style={{ marginBottom: '20px', color: '#64748b' }}>Select a registered vendor to assign to <strong>Order #{selectedBookingForAlloc.id}</strong></p>
                                {vendors.map(vendor => (
                                    <div key={vendor.id} className="vendor-create-card" onClick={() => handleAllocate(vendor.id)}>
                                        <div className="vendor-avatar small">{vendor.name.charAt(0)}</div>
                                        <div>
                                            <h4>{vendor.name}</h4>
                                            <span>{vendor.specialty}</span>
                                        </div>
                                        <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
                                    </div>
                                ))}
                                {vendors.length === 0 && <p>No vendors found. Please register vendors first.</p>}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default Admin

