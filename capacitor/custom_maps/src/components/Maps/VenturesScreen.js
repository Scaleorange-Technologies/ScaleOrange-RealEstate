import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, ZoomControl } from 'react-leaflet';
import { Calendar, MapPin, Home, FileText, DollarSign, Clock, CheckCircle, Building, Phone, Mail, User, CreditCard, Grid, Eye, ArrowLeft, IndianRupee } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const FAKE_PLOTS_DATA = [
    {
        id: 'SO001',
        title: 'Premium Villa Plot - Gachibowli',
        location: 'Gachibowli, Hyderabad',
        area: '200 sq yards',
        price: 8500000,
        tokenAmount: 850000,
        amenities: ['Gated Community', 'Club House', '24/7 Security', 'Parks'],
        coordinates: [17.4239, 78.3776],
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
        description: 'Premium residential plot in the heart of Gachibowli tech hub'
    },
    {
        id: 'SO002',
        title: 'Luxury Apartment Plot - Kondapur',
        location: 'Kondapur, Hyderabad',
        area: '150 sq yards',
        price: 6200000,
        tokenAmount: 620000,
        amenities: ['Swimming Pool', 'Gym', 'Garden', 'Power Backup'],
        coordinates: [17.4647, 78.3698],
        images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
        description: 'Modern apartment plot with excellent connectivity'
    },
    {
        id: 'SO003',
        title: 'Commercial Plot - HITEC City',
        location: 'HITEC City, Hyderabad',
        area: '300 sq yards',
        price: 12000000,
        tokenAmount: 1200000,
        amenities: ['Prime Location', 'Metro Connectivity', 'IT Hub', 'Shopping Centers'],
        coordinates: [17.4483, 78.3915],
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
        description: 'Prime commercial plot in the bustling HITEC City'
    },
    {
        id: 'SO004',
        title: 'Residential Plot - Kukatpally',
        location: 'Kukatpally, Hyderabad',
        area: '180 sq yards',
        price: 4500000,
        tokenAmount: 450000,
        amenities: ['Schools Nearby', 'Hospital Access', 'Public Transport', 'Markets'],
        coordinates: [17.4840, 78.4075],
        images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
        description: 'Family-friendly residential plot with all essential amenities'
    }
];
const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];
export const SOVenturesApp = () => {
    const [currentScreen, setCurrentScreen] = useState('ventures');
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [hoveredPlot, setHoveredPlot] = useState(null);
    const [bookingData, setBookingData] = useState(null);
    const [paymentData, setPaymentData] = useState({});
    const [appointmentData, setAppointmentData] = useState({});
    // Fix for Leaflet default markers
    useEffect(() => {
        // Fix for default markers
        delete window.L?.Icon?.Default?.prototype._getIconUrl;
        if (window.L) {
            window.L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        }
    }, []);

    // Custom marker icon for different plot types
    const createCustomIcon = (plotId, isHovered = false) => {
        if (!window.L) return null;

        const color = isHovered ? '#E64A19' : '#FF5722';
        const scale = isHovered ? 1.2 : 1;

        return window.L.divIcon({
            html: `
            <div style="
                width: ${30 * scale}px;
                height: ${30 * scale}px;
                background-color: ${color};
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            ">
                <div style="
                    color: white;
                    font-size: ${12 * scale}px;
                    font-weight: bold;
                    transform: rotate(45deg);
                ">
                    ${plotId.slice(-1)}
                </div>
            </div>
        `,
            className: 'custom-marker',
            iconSize: [30 * scale, 30 * scale],
            iconAnchor: [15 * scale, 30 * scale],
            popupAnchor: [0, -30 * scale]
        });
    };

    // Move BookingScreen inside the main component so it has access to selectedPlot
    const BookingScreen = () => {
        const [formData, setFormData] = useState({
            fullName: '',
            email: '',
            phone: '',
            address: '',
            occupation: '',
            panNumber: '',
            aadharNumber: ''
        });

        const handleInputChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

        const handleBookingSubmit = () => {
            if (!formData.fullName || !formData.email || !formData.phone) {
                alert('Please fill all required fields');
                return;
            }

            setBookingData({ ...formData, plot: selectedPlot });
            alert(`Booking submitted for ${selectedPlot?.title}! Token amount: ₹${(selectedPlot?.tokenAmount / 100000).toFixed(1)}L`);
            // You can add payment screen navigation here
            setCurrentScreen('payment');
        };

        return (
            <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto' }}>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <button
                        onClick={() => setCurrentScreen('ventures')}
                        style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 style={{ margin: 0 }}>Book Your Plot</h2>
                        <p style={{ margin: '5px 0 0', opacity: 0.9 }}>{selectedPlot?.title || 'No plot selected'}</p>
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    {selectedPlot && (
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ margin: '0 0 10px', color: '#333' }}>Plot Details</h3>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                <div>Plot ID: {selectedPlot.id}</div>
                                <div>Location: {selectedPlot.location}</div>
                                <div>Area: {selectedPlot.area}</div>
                                <div>Total Price: ₹{(selectedPlot.price / 100000).toFixed(1)}L</div>
                                <div>Token Amount: ₹{(selectedPlot.tokenAmount / 100000).toFixed(1)}L</div>
                            </div>
                        </div>
                    )}

                    {!selectedPlot && (
                        <div style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            padding: '15px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <p style={{ margin: 0, color: '#856404' }}>No plot selected. Please go back and select a plot first.</p>
                        </div>
                    )}

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Address
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    minHeight: '80px',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter your address"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Occupation
                            </label>
                            <input
                                type="text"
                                value={formData.occupation}
                                onChange={(e) => handleInputChange('occupation', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter your occupation"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                PAN Number
                            </label>
                            <input
                                type="text"
                                value={formData.panNumber}
                                onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter PAN number"
                                maxLength="10"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Aadhar Number
                            </label>
                            <input
                                type="text"
                                value={formData.aadharNumber}
                                onChange={(e) => handleInputChange('aadharNumber', e.target.value.replace(/\D/g, ''))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter Aadhar number"
                                maxLength="12"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleBookingSubmit}
                            disabled={!selectedPlot}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: selectedPlot ? '#9C27B0' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: selectedPlot ? 'pointer' : 'not-allowed',
                                marginTop: '20px'
                            }}
                        >
                            {selectedPlot ? 'Proceed to Payment' : 'Please select a plot first'}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const PaymentScreen = () => {
        const [paymentMethod, setPaymentMethod] = useState('card');
        const [cardData, setCardData] = useState({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardholderName: ''
        });

        const handlePayment = () => {
            // Simulate payment processing
            setPaymentData({
                method: paymentMethod,
                amount: selectedPlot.tokenAmount,
                transactionId: 'TXN' + Date.now(),
                timestamp: new Date().toISOString()
            });
            setCurrentScreen('payment-success');
        };

        return (
            <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto' }}>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <button
                        onClick={() => setCurrentScreen('booking')}
                        style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
                    >
                        ←
                    </button>
                    <div>
                        <h2 style={{ margin: 0 }}>Token Payment</h2>
                        <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Secure your plot booking</p>
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 15px', color: '#333' }}>Payment Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Plot: {selectedPlot?.title}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Total Price:</span>
                            <span>₹{(selectedPlot?.price / 100000).toFixed(1)}L</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                            <span>Token Amount:</span>
                            <span>₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
                            <span>Remaining Amount:</span>
                            <span>₹{((selectedPlot?.price - selectedPlot?.tokenAmount) / 100000).toFixed(1)}L</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 15px', color: '#333' }}>Payment Method</h3>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            {[
                                { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                                { id: 'upi', label: 'UPI', icon: Phone },
                                { id: 'netbanking', label: 'Net Banking', icon: Building }
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setPaymentMethod(id)}
                                    style={{
                                        flex: 1,
                                        padding: '15px 10px',
                                        border: `2px solid ${paymentMethod === id ? '#4CAF50' : '#ddd'}`,
                                        borderRadius: '8px',
                                        backgroundColor: paymentMethod === id ? '#E8F5E8' : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '12px'
                                    }}
                                >
                                    <Icon size={20} color={paymentMethod === id ? '#4CAF50' : '#666'} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {paymentMethod === 'card' && (
                        <div>
                            <h3 style={{ margin: '0 0 15px', color: '#333' }}>Card Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Card Number"
                                    value={cardData.cardNumber}
                                    onChange={(e) => setCardData(prev => ({ ...prev, cardNumber: e.target.value }))}
                                    style={{
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '16px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={cardData.expiryDate}
                                        onChange={(e) => setCardData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVV"
                                        value={cardData.cvv}
                                        onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cardholder Name"
                                    value={cardData.cardholderName}
                                    onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
                                    style={{
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        style={{
                            width: '100%',
                            padding: '15px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <DollarSign size={20} />
                        Pay ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L
                    </button>
                </div>
            </div>
        );
    };

    // Payment Success Screen
    const PaymentSuccessScreen = () => {
        const [selectedDate, setSelectedDate] = useState('');

        const handleDateSelection = () => {
            if (!selectedDate) {
                alert('Please select a payment date');
                return;
            }
            setCurrentScreen('appointment');
        };

        const remainingAmount = selectedPlot?.price - selectedPlot?.tokenAmount;

        return (
            <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto' }}>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <CheckCircle size={48} style={{ marginBottom: '10px' }} />
                    <h1 style={{ margin: 0 }}>Payment Successful!</h1>
                    <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Token amount paid successfully</p>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{
                        backgroundColor: '#E8F5E8',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ margin: '0 0 10px', color: '#4CAF50' }}>
                            ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L Paid
                        </h2>
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                            Transaction ID: {paymentData.transactionId}
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#fff3cd',
                        padding: '15px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '1px solid #ffeaa7'
                    }}>
                        <h3 style={{ margin: '0 0 10px', color: '#856404' }}>Remaining Payment</h3>
                        <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#856404' }}>
                            Amount due: ₹{(remainingAmount / 100000).toFixed(1)}L
                        </p>
                        <p style={{ margin: '0 0 15px', fontSize: '14px', color: '#856404' }}>
                            Please select your preferred payment date for the remaining amount:
                        </p>

                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '16px',
                                marginBottom: '15px'
                            }}
                        />

                        <button
                            onClick={handleDateSelection}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#FF9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Schedule Remaining Payment
                        </button>
                    </div>

                    <button
                        onClick={() => setCurrentScreen('appointment')}
                        style={{
                            width: '100%',
                            padding: '15px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Calendar size={20} />
                        Schedule Site Visit
                    </button>
                </div>
            </div>
        );
    };

    const AppointmentScreen = () => {
        const [appointmentForm, setAppointmentForm] = useState({
            date: '',
            time: '',
            purpose: 'site-visit',
            notes: ''
        });

        const handleAppointmentSubmit = () => {
            if (!appointmentForm.date || !appointmentForm.time) {
                alert('Please select date and time');
                return;
            }

            setAppointmentData({
                ...appointmentForm,
                plot: selectedPlot,
                customerName: bookingData.fullName,
                bookedAt: new Date().toISOString()
            });
            setCurrentScreen('appointment-success');
        };

        const today = new Date().toISOString().split('T')[0];

        return (
            <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto' }}>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <button
                        onClick={() => setCurrentScreen('payment-success')}
                        style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
                    >
                        ←
                    </button>
                    <div>
                        <h2 style={{ margin: 0 }}>Schedule Appointment</h2>
                        <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Book your site visit</p>
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 10px', color: '#333' }}>Appointment For</h3>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            <div>Plot: {selectedPlot?.title}</div>
                            <div>Customer: {bookingData?.fullName}</div>
                            <div>Phone: {bookingData?.phone}</div>
                        </div>
                    </div>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Appointment Date *
                            </label>
                            <input
                                type="date"
                                value={appointmentForm.date}
                                onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                                min={today}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Preferred Time *
                            </label>
                            <select
                                value={appointmentForm.time}
                                onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="">Select time slot</option>
                                {TIME_SLOTS.map(slot => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Purpose of Visit
                            </label>
                            <select
                                value={appointmentForm.purpose}
                                onChange={(e) => setAppointmentForm(prev => ({ ...prev, purpose: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="site-visit">Site Visit</option>
                                <option value="documentation">Documentation</option>
                                <option value="payment">Payment Discussion</option>
                                <option value="consultation">General Consultation</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Additional Notes
                            </label>
                            <textarea
                                value={appointmentForm.notes}
                                onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                                placeholder="Any specific requirements or questions..."
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleAppointmentSubmit}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Clock size={20} />
                            Book Appointment
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    // Appointment Success Screen
    const AppointmentSuccessScreen = () => (
        <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto' }}>
            <div style={{
                padding: '20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                textAlign: 'center'
            }}>
                <Calendar size={48} style={{ marginBottom: '10px' }} />
                <h1 style={{ margin: 0 }}>Appointment Booked!</h1>
                <p style={{ margin: '5px 0 0', opacity: 0.9 }}>We'll see you soon</p>
            </div>

            <div style={{ padding: '20px' }}>
                <div style={{
                    backgroundColor: '#E8F5E8',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ margin: '0 0 15px', color: '#4CAF50' }}>Appointment Details</h2>
                    <div style={{ fontSize: '16px', color: '#333', lineHeight: '1.6' }}>
                        <div><strong>Date:</strong> {appointmentData.date}</div>
                        <div><strong>Time:</strong> {appointmentData.time}</div>
                        <div><strong>Purpose:</strong> {appointmentData.purpose?.replace('-', ' ').toUpperCase()}</div>
                        <div><strong>Plot:</strong> {appointmentData.plot?.title}</div>
                        <div><strong>Location:</strong> {appointmentData.plot?.location}</div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#fff3cd',
                    padding: '15px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '1px solid #ffeaa7'
                }}>
                    <h3 style={{ margin: '0 0 10px', color: '#856404' }}>Important Notes</h3>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404', fontSize: '14px' }}>
                        <li>Please bring a valid ID proof</li>
                        <li>Our representative will contact you 1 day before</li>
                        <li>In case of any changes, call our office</li>
                        <li>Site visit duration: approximately 1-2 hours</li>
                    </ul>
                </div>

                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: '0 0 10px', color: '#333' }}>Contact Information</h3>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <Phone size={16} />
                            <span>+91 98765 43210</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <Mail size={16} />
                            <span>support@scaleorange.com</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building size={16} />
                            <span>ScaleOrange Office, Hyderabad</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setCurrentScreen('ventures');
                        setSelectedPlot(null);
                        setBookingData({});
                        setPaymentData({});
                        setAppointmentData({});
                    }}
                    style={{
                        width: '100%',
                        padding: '15px',
                        backgroundColor: '#FF5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Home size={20} />
                    Back to Ventures
                </button>
            </div>
        </div>
    );

    const MapView = () => (
        <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto', backgroundColor: '#f5f5f5' }}>
            <div style={{
                padding: '20px',
                backgroundColor: '#FF5722',
                color: 'white',
                textAlign: 'center'
            }}>
                <button
                    onClick={() => setCurrentScreen('ventures')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '18px',
                        cursor: 'pointer',
                        position: 'absolute',
                        left: '20px'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <MapPin size={24} />
                    Ventures Map
                </h2>
                <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Hyderabad Premium Locations</p>
            </div>

            <div style={{ padding: '20px' }}>
                {/* Real Map Container */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginBottom: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden' }}>
                        <MapContainer
                            center={[17.4550, 78.3852]} // Center of Hyderabad
                            zoom={12}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <ZoomControl position="topright" />

                            {/* Plot Markers */}
                            {FAKE_PLOTS_DATA.map((plot) => (
                                <Marker
                                    key={plot.id}
                                    position={[plot.coordinates[0], plot.coordinates[1]]}
                                    icon={createCustomIcon(plot.id, hoveredPlot === plot.id)}
                                    eventHandlers={{
                                        mouseover: () => setHoveredPlot(plot.id),
                                        mouseout: () => setHoveredPlot(null),
                                        click: () => setSelectedPlot(plot)
                                    }}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '250px', padding: '8px' }}>
                                            <img
                                                src={plot.images[0]}
                                                alt={plot.title}
                                                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                                            />
                                            <h4 style={{ margin: '0 0 8px', color: '#333', fontSize: '16px' }}>{plot.title}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                                <MapPin size={14} color="#666" />
                                                <span style={{ color: '#666', fontSize: '14px' }}>{plot.location}</span>
                                            </div>
                                            <p style={{ margin: '0 0 12px', color: '#666', fontSize: '13px', lineHeight: '1.4' }}>
                                                {plot.description}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div>
                                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF5722' }}>
                                                        ₹{(plot.price / 100000).toFixed(1)}L
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>{plot.area}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>Token Amount</div>
                                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FF5722' }}>
                                                        ₹{(plot.tokenAmount / 100000).toFixed(1)}L
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                                                {plot.amenities.slice(0, 2).map((amenity, index) => (
                                                    <span key={index} style={{
                                                        backgroundColor: '#f0f0f0',
                                                        color: '#666',
                                                        padding: '2px 6px',
                                                        borderRadius: '8px',
                                                        fontSize: '10px'
                                                    }}>
                                                        {amenity}
                                                    </span>
                                                ))}
                                                {plot.amenities.length > 2 && (
                                                    <span style={{ color: '#666', fontSize: '10px' }}>+{plot.amenities.length - 2} more</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedPlot(plot);
                                                    setCurrentScreen('booking')
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    backgroundColor: '#FF5722',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Book this Plot
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Plots List */}
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ margin: '0 0 15px', color: '#333' }}>Available Plots ({FAKE_PLOTS_DATA.length})</h3>
                    {FAKE_PLOTS_DATA.map((plot) => (
                        <div
                            key={plot.id}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                border: hoveredPlot === plot.id ? '2px solid #FF5722' : '2px solid transparent',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={() => setHoveredPlot(plot.id)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            onClick={() => setSelectedPlot(plot)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, color: '#333' }}>{plot.title}</h4>
                                        <span style={{
                                            backgroundColor: '#FF5722',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '8px',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}>
                                            {plot.id}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px' }}>
                                        <MapPin size={12} />
                                        {plot.location}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF5722' }}>
                                        ₹{(plot.price / 100000).toFixed(1)}L
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>{plot.area}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const VenturesScreen = () => (
        <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto' }}>
            <div style={{
                padding: '20px',
                backgroundColor: '#FF5722',
                color: 'white',
                textAlign: 'center'
            }}>
                <button
                    onClick={() => setCurrentScreen('maps')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '18px',
                        cursor: 'pointer',
                        position: 'absolute',
                        right: '20px',
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255,255,255,0.2)'
                    }}
                >
                    <MapPin size={20} />
                </button>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Home size={24} />
                    SO Ventures
                </h2>
                <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Premium Real Estate Opportunities</p>
            </div>

            <div style={{ padding: '20px' }}>
                {FAKE_PLOTS_DATA.map((plot) => (
                    <div key={plot.id} style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        marginBottom: '20px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={plot.images[0]}
                            alt={plot.title}
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />

                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, color: '#333', flex: 1 }}>{plot.title}</h3>
                                <span style={{
                                    backgroundColor: '#E8F5E8',
                                    color: '#4CAF50',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {plot.id}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <MapPin size={16} color="#666" />
                                <span style={{ color: '#666' }}>{plot.location}</span>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{plot.description}</p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                        ₹{(plot.price / 100000).toFixed(1)}L
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{plot.area}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', color: '#FF5722' }}>Token Amount</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF5722' }}>
                                        ₹{(plot.tokenAmount / 100000).toFixed(1)}L
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                                {plot.amenities.slice(0, 3).map((amenity, index) => (
                                    <span key={index} style={{
                                        backgroundColor: '#f0f0f0',
                                        color: '#666',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {amenity}
                                    </span>
                                ))}
                                {plot.amenities.length > 3 && (
                                    <span style={{ color: '#666', fontSize: '12px' }}>+{plot.amenities.length - 3} more</span>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedPlot(plot);
                                    setCurrentScreen('booking');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#FF5722',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#E64A19'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#FF5722'}
                            >
                                Book This Plot
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Selected Plot Modal - only show when currentScreen is 'ventures' or 'maps'
    const PlotModal = () => {
        if (!selectedPlot || currentScreen === 'booking') return null;

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }} onClick={() => setSelectedPlot(null)}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }} onClick={(e) => e.stopPropagation()}>
                    <h3 style={{ margin: '0 0 16px', color: '#333' }}>{selectedPlot.title}</h3>
                    <img
                        src={selectedPlot.images[0]}
                        alt={selectedPlot.title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
                    />
                    <p style={{ color: '#666', marginBottom: '16px' }}>{selectedPlot.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                                ₹{(selectedPlot.price / 100000).toFixed(1)}L
                            </div>
                            <div style={{ color: '#666' }}>{selectedPlot.area}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#FF5722', fontWeight: 'bold' }}>Token Amount</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF5722' }}>
                                ₹{(selectedPlot.tokenAmount / 100000).toFixed(1)}L
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setSelectedPlot(null)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: '#f0f0f0',
                                color: '#666',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                // Keep the selectedPlot and navigate to booking
                                setCurrentScreen('booking');
                            }}
                            style={{
                                flex: 2,
                                padding: '12px',
                                backgroundColor: '#FF5722',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Proceed to Book
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {currentScreen === 'ventures' && (
                <>
                    <VenturesScreen />
                    <PlotModal />
                </>
            )}
            {currentScreen === 'maps' && <MapView />}
            {currentScreen === 'booking' && <BookingScreen />}
            {currentScreen === 'payment' && <PaymentScreen />}
            {currentScreen === 'payment-success' && <PaymentSuccessScreen/>}
            {currentScreen === 'appointment' && <AppointmentScreen/>}
            {currentScreen === 'appointment-success' && <AppointmentSuccessScreen/>}
        </div>

    );
};