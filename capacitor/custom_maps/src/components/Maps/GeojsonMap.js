import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Home, FileText, DollarSign, Clock, CheckCircle, Building, Phone, Mail, User, CreditCard, Grid, Eye, ArrowLeft, IndianRupee, Shield, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { App } from '@capacitor/app';
import { SOVenturesApp } from './VenturesScreen';
import { MapsScreen } from './MapsScreen';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import HomeScreen from './HomeScreen';

if (typeof window !== "undefined" && !window._externalLocationHandlerSet) {
    window._externalLocationHandlerSet = true;
    window.handleExternalLocation = (lat, lng) => {
        window.dispatchEvent(new CustomEvent("externalLocation", { detail: { lat, lng } }));
    };
}
const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];


// Main App Component
export default function SOMultiScreenApp() {
    const [mapCenter, setMapCenter] = useState([17.4550, 78.3852]); // Default to Hyderabad
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('maps');
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [bookingData, setBookingData] = useState({});
    const [paymentData, setPaymentData] = useState({});
    const [appointmentData, setAppointmentData] = useState({});
    const [plotStatuses, setPlotStatuses] = useState({}); // Track booked/reserved status
    const [selectedSubPlot, setSelectedSubPlot] = useState(null);
    useEffect(() => {
        let backButtonListener = null;

        const setupBackButton = async () => {
            try {
                backButtonListener = await App.addListener('backButton', () => {
                    // Handle back navigation based on current screen
                    switch (currentScreen) {
                        case 'ventures':
                            setCurrentScreen('maps');
                            break;
                        case 'mapss':
                            setCurrentScreen('ventures');
                            break;
                        case 'booking':
                            setCurrentScreen('ventures');
                            setSelectedPlot(null);
                            break;
                        case 'payment':
                            setCurrentScreen('booking');
                            break;
                        case 'payment-success':
                            setCurrentScreen('payment');
                            break;
                        case 'appointment':
                            setCurrentScreen('booking');
                            break;
                        case 'appointment-success':
                            setCurrentScreen('ventures');
                            setSelectedPlot(null);
                            setBookingData({});
                            setPaymentData({});
                            setAppointmentData({});
                            break;
                        case 'mybookings':
                            setCurrentScreen('maps');
                            break;
                        default:
                            setCurrentScreen('ventures');
                            break;
                    }
                });
            } catch (error) {
                console.log('Back button setup error:', error);
            }
        };

        setupBackButton();

        return () => {
            if (backButtonListener) {
                backButtonListener.remove();
            }
        };
    }, [currentScreen]);


    // Updated handleSubPlotClick function (in parent)
    const handleSubPlotClick = (plot, subPlot) => {
        const subPlotData = {
            ...subPlot,
            parentPlot: plot,
            title: `${plot.title} - Sub Plot ${subPlot.id.split('-').pop()}`,
            location: plot.location,
            area: subPlot.measurement,
            price: plot.price / 4, // Assuming 4 sub-plots, divide price equally
            tokenAmount: plot.tokenAmount / 4,
            amenities: plot.amenities,
            images: plot.images,
            description: `${plot.description} - Individual sub-plot of ${subPlot.measurement}`
        };

        setSelectedSubPlot(subPlotData);
        setSelectedPlot(subPlotData); // Pass sub-plot data to booking
    };

    // Updated booking handlers (in parent)
    const handleBookingSubmit = (withPayment = false) => {
        const plotKey = selectedSubPlot?.id || selectedPlot?.id;

        if (withPayment) {
            setCurrentScreen('payment');
        } else {
            // Book for site visit only
            setPlotStatuses(prev => ({
                ...prev,
                [plotKey]: 'booked'
            }));
            setCurrentScreen('appointment');
        }
    };

    const handlePaymentSuccess = () => {
        const plotKey = selectedSubPlot?.id || selectedPlot?.id;
        console.log("plotkeyyy:", plotKey);
        setPlotStatuses(prev => ({
            ...prev,
            [plotKey]: 'reserved'
        }));
        setPaymentData({
            method: paymentMethod,
            amount: selectedPlot.tokenAmount,
            transactionId: 'TXN' + Date.now(),
            timestamp: new Date().toISOString(),
            plotId: plotKey
        });
        setCurrentScreen('payment-success');
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const BookingScreen = ({ setCurrentScreen, selectedPlot, handleBookingSubmit }) => {
        const [formData, setFormData] = useState({
            fullName: 'sai',
            email: 'sai@example.com',
            phone: '9876543210',
            address: 'Hyderabad',
            occupation: 'SoftwareDeveloper',
            panNumber: '9876543211234',
            aadharNumber: '98765432028'
        });

        const handleInputChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

        const keyframes = `
            @keyframes slideInFromTop {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
    
            @keyframes slideInFromBottom {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
    
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
    
            @keyframes shimmer {
                0% {
                    background-position: -200px 0;
                }
                100% {
                    background-position: calc(200px + 100%) 0;
                }
            }
    
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.02);
                }
            }
    
            .form-field {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
    
            .form-field:focus-within {
                transform: translateY(-2px);
            }
    
            .form-field input:focus,
            .form-field textarea:focus {
                border-color: #9C27B0 !important;
                box-shadow: 0 0 0 3px rgba(156, 39, 176, 0.1) !important;
                outline: none;
            }
    
            .form-field label {
                transition: color 0.3s ease;
            }
    
            .form-field:focus-within label {
                color: #9C27B0;
            }
    
            .button-hover:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
    
            .button-hover:active {
                transform: translateY(0);
            }
    
            .shimmer-bg {
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                background-size: 200px 100%;
                animation: shimmer 2s infinite;
            }
    
            .floating-elements::before,
            .floating-elements::after {
                content: '';
                position: absolute;
                border-radius: 50%;
                background: rgba(156, 39, 176, 0.1);
                animation: float 6s ease-in-out infinite;
            }
    
            .floating-elements::before {
                width: 80px;
                height: 80px;
                top: 10%;
                right: 5%;
                animation-delay: -2s;
            }
    
            .floating-elements::after {
                width: 60px;
                height: 60px;
                bottom: 15%;
                left: 8%;
                animation-delay: -4s;
            }
    
            @keyframes float {
                0%, 100% {
                    transform: translateY(0px) rotate(0deg);
                }
                50% {
                    transform: translateY(-15px) rotate(5deg);
                }
            }
        `;

        return (
            <>
                <style>{keyframes}</style>
                <div style={{
                    height: '100vh',
                    paddingBottom: '80px',
                    overflowY: 'auto',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'relative'
                }} className="floating-elements">
                    {/* Enhanced Header */}
                    <div style={{
                        padding: '24px 20px',
                        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.95), rgba(233, 30, 99, 0.95))',
                        backdropFilter: 'blur(20px)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        animation: 'slideInFromTop 0.6s ease-out'
                    }}>
                        <button
                            onClick={() => setCurrentScreen('ventures')}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '12px',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                            className="button-hover"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '24px',
                                fontWeight: '700',
                                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                            }}>🏡 Book Your Plot</h2>
                            <p style={{
                                margin: '5px 0 0',
                                opacity: 0.9,
                                fontSize: '16px',
                                fontWeight: '500'
                            }}>{selectedPlot?.title || 'No plot selected'}</p>
                        </div>
                    </div>

                    <div style={{
                        padding: '24px 20px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        minHeight: 'calc(100vh - 160px)',
                        margin: '0 16px 16px',
                        borderRadius: '24px 24px 0 0',
                        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1)',
                        animation: 'slideInFromBottom 0.8s ease-out 0.2s both'
                    }}>
                        {selectedPlot && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                padding: '24px',
                                borderRadius: '20px',
                                marginBottom: '24px',
                                position: 'relative',
                                overflow: 'hidden',
                                animation: 'fadeInScale 0.6s ease-out 0.4s both'
                            }}>
                                <div className="shimmer-bg" style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: 'linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.5), transparent)'
                                }} />
                                <h3 style={{
                                    margin: '0 0 16px',
                                    color: '#2E7D32',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    📋 Plot Details
                                </h3>
                                <div style={{
                                    fontSize: '15px',
                                    color: '#424242',
                                    display: 'grid',
                                    gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(76, 175, 80, 0.2)' }}>
                                        <span style={{ fontWeight: '600' }}>Plot ID:</span>
                                        <span style={{ color: '#2E7D32', fontWeight: '700' }}>{selectedPlot.id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(76, 175, 80, 0.2)' }}>
                                        <span style={{ fontWeight: '600' }}>Location:</span>
                                        <span>{selectedPlot.location}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(76, 175, 80, 0.2)' }}>
                                        <span style={{ fontWeight: '600' }}>Area:</span>
                                        <span>{selectedPlot.area}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(76, 175, 80, 0.2)' }}>
                                        <span style={{ fontWeight: '600' }}>Total Price:</span>
                                        <span style={{ color: '#E53E3E', fontWeight: '700', fontSize: '16px' }}>₹{(selectedPlot.price / 100000).toFixed(1)}L</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '12px' }}>
                                        <span style={{ fontWeight: '700', color: '#2E7D32' }}>Token Amount:</span>
                                        <span style={{ color: '#2E7D32', fontWeight: '800', fontSize: '18px' }}>₹{(selectedPlot.tokenAmount / 100000).toFixed(1)}L</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!selectedPlot && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
                                border: '1px solid rgba(255, 193, 7, 0.3)',
                                padding: '24px',
                                borderRadius: '20px',
                                marginBottom: '24px',
                                textAlign: 'center',
                                animation: 'pulse 2s infinite'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                                <p style={{ margin: 0, color: '#F57C00', fontWeight: '600', fontSize: '16px' }}>
                                    No plot selected. Please go back and select a plot first.
                                </p>
                            </div>
                        )}

                        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { field: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', required: true, icon: '👤' },
                                { field: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email', required: true, icon: '📧' },
                                { field: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter your phone number', required: true, icon: '📱' },
                                { field: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter your address', required: false, icon: '🏠' },
                                { field: 'occupation', label: 'Occupation', type: 'text', placeholder: 'Enter your occupation', required: false, icon: '💼' },
                                { field: 'panNumber', label: 'PAN Number', type: 'text', placeholder: 'Enter PAN number', required: false, icon: '🆔', maxLength: 10 },
                                { field: 'aadharNumber', label: 'Aadhar Number', type: 'text', placeholder: 'Enter Aadhar number', required: false, icon: '🆔', maxLength: 12 }
                            ].map((fieldConfig, index) => (
                                <div key={fieldConfig.field} className="form-field" style={{
                                    animation: `fadeInScale 0.6s ease-out ${0.6 + index * 0.1}s both`
                                }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#424242',
                                        fontSize: '15px'
                                    }}>
                                        <span>{fieldConfig.icon}</span>
                                        {fieldConfig.label} {fieldConfig.required && <span style={{ color: '#E53E3E' }}>*</span>}
                                    </label>
                                    {fieldConfig.type === 'textarea' ? (
                                        <textarea
                                            value={formData[fieldConfig.field]}
                                            onChange={(e) => handleInputChange(fieldConfig.field, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                border: '2px solid #E0E0E0',
                                                borderRadius: '12px',
                                                fontSize: '16px',
                                                minHeight: '100px',
                                                resize: 'vertical',
                                                boxSizing: 'border-box',
                                                transition: 'all 0.3s ease',
                                                background: 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                            placeholder={fieldConfig.placeholder}
                                        />
                                    ) : (
                                        <input
                                            type={fieldConfig.type}
                                            value={formData[fieldConfig.field]}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                if (fieldConfig.field === 'panNumber') {
                                                    value = value.toUpperCase();
                                                } else if (fieldConfig.field === 'aadharNumber') {
                                                    value = value.replace(/\D/g, '');
                                                }
                                                handleInputChange(fieldConfig.field, value);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                border: '2px solid #E0E0E0',
                                                borderRadius: '12px',
                                                fontSize: '16px',
                                                boxSizing: 'border-box',
                                                transition: 'all 0.3s ease',
                                                background: 'rgba(255, 255, 255, 0.8)',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                            placeholder={fieldConfig.placeholder}
                                            maxLength={fieldConfig.maxLength}
                                        />
                                    )}
                                </div>
                            ))}

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginTop: '32px',
                                animation: 'fadeInScale 0.6s ease-out 1.4s both'
                            }}>
                                <button
                                    onClick={() => handleBookingSubmit(false)}
                                    disabled={!selectedPlot}
                                    style={{
                                        flex: 1,
                                        padding: '18px',
                                        background: selectedPlot ? 'linear-gradient(135deg, #2196F3, #21CBF3)' : '#ccc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        cursor: selectedPlot ? 'pointer' : 'not-allowed',
                                        boxShadow: selectedPlot ? '0 8px 25px rgba(33, 150, 243, 0.3)' : 'none',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    className={selectedPlot ? "button-hover" : ""}
                                >
                                    <span>🏠</span>
                                    Book Site Visit
                                </button>

                                <button
                                    onClick={() => handleBookingSubmit(true)}
                                    disabled={!selectedPlot}
                                    style={{
                                        flex: 1,
                                        padding: '18px',
                                        background: selectedPlot ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' : '#ccc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        cursor: selectedPlot ? 'pointer' : 'not-allowed',
                                        boxShadow: selectedPlot ? '0 8px 25px rgba(76, 175, 80, 0.3)' : 'none',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    className={selectedPlot ? "button-hover" : ""}
                                >
                                    <span>💳</span>
                                    Pay Token & Reserve
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </>
        );
    };

    const PaymentScreen = ({ setCurrentScreen, selectedPlot }) => {
        const [paymentMethod, setPaymentMethod] = useState('card');
        const [cardData, setCardData] = useState({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardholderName: ''
        });
        const [upiId, setUpiId] = useState('');
        const [showRazorpayModal, setShowRazorpayModal] = useState(false);
        const [paymentStep, setPaymentStep] = useState('method');
        const [processingProgress, setProcessingProgress] = useState(0);
        const [currentScreen, setCurrentScreenState] = useState('payment');
        const [paymentData, setPaymentData] = useState(null);

        const handlePaymentSuccess = () => {
            setPaymentData({
                method: paymentMethod,
                amount: selectedPlot.tokenAmount,
                transactionId: 'pay_' + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
            });
            setPaymentStep('success');
            setTimeout(() => {
                setShowRazorpayModal(false);
                setCurrentScreen('payment-success');
            }, 2000);
        };

        const handleRazorpayPayment = () => {
            setShowRazorpayModal(true);
            setPaymentStep('method');
        };

        const processPayment = () => {
            setPaymentStep('processing');
            setProcessingProgress(0);

            const interval = setInterval(() => {
                setProcessingProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        handlePaymentSuccess();
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);
        };

        const formatCardNumber = (value) => {
            const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            const matches = v.match(/\d{4,16}/g);
            const match = matches && matches[0] || '';
            const parts = [];
            for (let i = 0, len = match.length; i < len; i += 4) {
                parts.push(match.substring(i, i + 4));
            }
            if (parts.length) {
                return parts.join(' ');
            } else {
                return v;
            }
        };

        const handleCardNumberChange = (e) => {
            const formatted = formatCardNumber(e.target.value);
            if (formatted.replace(/\s/g, '').length <= 16) {
                setCardData(prev => ({ ...prev, cardNumber: formatted }));
            }
        };

        const handleExpiryChange = (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            setCardData(prev => ({ ...prev, expiryDate: value }));
        };

        const keyframes = `
            @keyframes slideInFromTop {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
    
            @keyframes slideInFromBottom {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
    
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
    
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
    
            @keyframes progressGlow {
                0%, 100% {
                    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
                }
                50% {
                    box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
                }
            }
    
            .button-hover:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
    
            .button-hover:active {
                transform: translateY(0);
            }
    
            .payment-method-button {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
    
            .payment-method-button:hover {
                transform: translateY(-2px);
            }
    
            .floating-elements::before,
            .floating-elements::after {
                content: '';
                position: absolute;
                border-radius: 50%;
                background: rgba(76, 175, 80, 0.1);
                animation: float 6s ease-in-out infinite;
            }
    
            .floating-elements::before {
                width: 100px;
                height: 100px;
                top: 20%;
                right: 10%;
                animation-delay: -2s;
            }
    
            .floating-elements::after {
                width: 80px;
                height: 80px;
                bottom: 30%;
                left: 15%;
                animation-delay: -4s;
            }
    
            @keyframes float {
                0%, 100% {
                    transform: translateY(0px) rotate(0deg);
                }
                50% {
                    transform: translateY(-20px) rotate(10deg);
                }
            }
        `;

        return (
            <>
                <style>{keyframes}</style>
                <div style={{
                    height: '100vh',
                    paddingBottom: '80px',
                    overflowY: 'auto',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                    position: 'relative'
                }} className="floating-elements">
                    {/* Enhanced Header */}
                    <div style={{
                        padding: '24px 20px',
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(139, 195, 74, 0.95))',
                        backdropFilter: 'blur(20px)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        animation: 'slideInFromTop 0.6s ease-out'
                    }}>
                        <button
                            onClick={() => setCurrentScreen('booking')}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '12px',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                            className="button-hover"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '24px',
                                fontWeight: '700',
                                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                            }}>🔒 Secure Payment</h2>
                            <p style={{
                                margin: '5px 0 0',
                                opacity: 0.9,
                                fontSize: '16px',
                                fontWeight: '500'
                            }}>Complete your token payment</p>
                        </div>
                    </div>

                    <div style={{
                        padding: '24px 20px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        minHeight: 'calc(100vh - 160px)',
                        margin: '0 16px 16px',
                        borderRadius: '24px 24px 0 0',
                        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1)',
                        animation: 'slideInFromBottom 0.8s ease-out 0.2s both'
                    }}>
                        {/* Enhanced Payment Summary */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9))',
                            backdropFilter: 'blur(20px)',
                            padding: '24px',
                            borderRadius: '20px',
                            marginBottom: '24px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            animation: 'fadeInScale 0.6s ease-out 0.4s both',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #4CAF50, #8BC34A, #4CAF50)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 2s infinite'
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Shield size={24} color="white" />
                                </div>
                                <h3 style={{ margin: 0, color: '#2E7D32', fontSize: '22px', fontWeight: '700' }}>
                                    Payment Summary
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '12px 0',
                                    borderBottom: '1px solid rgba(76, 175, 80, 0.2)'
                                }}>
                                    <span style={{ color: '#666', fontWeight: '600' }}>💰 Total Price:</span>
                                    <span style={{ fontWeight: '700', fontSize: '16px' }}>₹{(selectedPlot?.price / 100000).toFixed(1)}L</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
                                    borderRadius: '12px',
                                    border: '2px solid rgba(76, 175, 80, 0.3)'
                                }}>
                                    <span style={{ color: '#2E7D32', fontWeight: '700', fontSize: '18px' }}>🎯 Token Amount:</span>
                                    <span style={{ color: '#2E7D32', fontWeight: '800', fontSize: '20px' }}>₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: '#666',
                                    fontSize: '14px',
                                    fontStyle: 'italic'
                                }}>
                                    <span>📋 Remaining Amount:</span>
                                    <span>₹{((selectedPlot?.price - selectedPlot?.tokenAmount) / 100000).toFixed(1)}L</span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Payment Button */}
                        <button
                            onClick={handleRazorpayPayment}
                            style={{
                                width: '100%',
                                padding: '20px',
                                background: 'linear-gradient(135deg, #2196F3, #21CBF3)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '18px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                animation: 'fadeInScale 0.6s ease-out 0.6s both',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            className="button-hover"
                            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                animation: 'shimmer 2s infinite'
                            }} />
                            <DollarSign size={24} />
                            <span>Pay ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L Securely</span>
                            <span style={{ fontSize: '20px' }}>🚀</span>
                        </button>

                        <div style={{
                            textAlign: 'center',
                            margin: '24px 0',
                            color: '#666',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            animation: 'fadeInScale 0.6s ease-out 0.8s both'
                        }}>
                            <Shield size={16} />
                            <span>🔐 Secured by 256-bit SSL encryption</span>
                        </div>
                    </div>

                    {/* Enhanced Razorpay Modal */}
                    {showRazorpayModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(76, 175, 80, 0.2))',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px',
                            animation: 'fadeInScale 0.3s ease-out'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.95))',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '20px',
                                width: '100%',
                                maxWidth: '420px',
                                maxHeight: '90vh',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                animation: 'modalSlideIn 0.4s ease-out'
                            }}>
                                {/* Enhanced Header */}
                                <div style={{
                                    padding: '24px',
                                    borderBottom: '1px solid rgba(76, 175, 80, 0.2)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'linear-gradient(135deg, #2196F3, #21CBF3)',
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }} />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                                            🏢 ScaleOrange Ventures
                                        </h3>
                                        <p style={{ margin: '5px 0 0', fontSize: '16px', opacity: 0.9, fontWeight: '600' }}>
                                            ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowRazorpayModal(false)}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            padding: '10px',
                                            borderRadius: '50%',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            zIndex: 1
                                        }}
                                        className="button-hover"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
                                    {paymentStep === 'method' && (
                                        <>
                                            {/* Enhanced Payment Methods */}
                                            <div style={{ marginBottom: '24px' }}>
                                                <h4 style={{
                                                    margin: '0 0 16px',
                                                    color: '#333',
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    textAlign: 'center'
                                                }}>
                                                    💳 Choose Payment Method
                                                </h4>
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                                    {[
                                                        { id: 'card', label: 'Card', icon: CreditCard, emoji: '💳' },
                                                        { id: 'upi', label: 'UPI', icon: Phone, emoji: '📱' },
                                                        { id: 'netbanking', label: 'Net Banking', icon: Building, emoji: '🏦' }
                                                    ].map(({ id, label, icon: Icon, emoji }) => (
                                                        <button
                                                            key={id}
                                                            onClick={() => setPaymentMethod(id)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '16px 8px',
                                                                border: `3px solid ${paymentMethod === id ? '#2196F3' : '#E0E0E0'}`,
                                                                borderRadius: '12px',
                                                                background: paymentMethod === id
                                                                    ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 203, 243, 0.1))'
                                                                    : 'rgba(255, 255, 255, 0.8)',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                backdropFilter: 'blur(10px)'
                                                            }}
                                                            className="payment-method-button"
                                                        >
                                                            <div style={{ fontSize: '24px' }}>{emoji}</div>
                                                            <Icon size={18} color={paymentMethod === id ? '#2196F3' : '#666'} />
                                                            <span style={{ color: paymentMethod === id ? '#2196F3' : '#666' }}>{label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Enhanced Payment Forms */}
                                            {paymentMethod === 'card' && (
                                                <div style={{ marginBottom: '24px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        <div>
                                                            <label style={{
                                                                display: 'block',
                                                                marginBottom: '8px',
                                                                fontSize: '15px',
                                                                color: '#333',
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}>
                                                                💳 Card Number
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="1234 5678 9012 3456"
                                                                value={cardData.cardNumber}
                                                                onChange={handleCardNumberChange}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '16px',
                                                                    border: '2px solid #E0E0E0',
                                                                    borderRadius: '12px',
                                                                    fontSize: '16px',
                                                                    boxSizing: 'border-box',
                                                                    transition: 'all 0.3s ease',
                                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                                    backdropFilter: 'blur(10px)'
                                                                }}
                                                            />
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <label style={{
                                                                    display: 'block',
                                                                    marginBottom: '8px',
                                                                    fontSize: '15px',
                                                                    color: '#333',
                                                                    fontWeight: '600',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                }}>
                                                                    📅 Expiry
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="MM/YY"
                                                                    value={cardData.expiryDate}
                                                                    onChange={handleExpiryChange}
                                                                    maxLength="5"
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '16px',
                                                                        border: '2px solid #E0E0E0',
                                                                        borderRadius: '12px',
                                                                        fontSize: '16px',
                                                                        boxSizing: 'border-box',
                                                                        transition: 'all 0.3s ease',
                                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                                        backdropFilter: 'blur(10px)'
                                                                    }}
                                                                />
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <label style={{
                                                                    display: 'block',
                                                                    marginBottom: '8px',
                                                                    fontSize: '15px',
                                                                    color: '#333',
                                                                    fontWeight: '600',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                }}>
                                                                    🔒 CVV
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="123"
                                                                    value={cardData.cvv}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.replace(/\D/g, '');
                                                                        if (value.length <= 3) {
                                                                            setCardData(prev => ({ ...prev, cvv: value }));
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '16px',
                                                                        border: '2px solid #E0E0E0',
                                                                        borderRadius: '12px',
                                                                        fontSize: '16px',
                                                                        boxSizing: 'border-box',
                                                                        transition: 'all 0.3s ease',
                                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                                        backdropFilter: 'blur(10px)'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label style={{
                                                                display: 'block',
                                                                marginBottom: '8px',
                                                                fontSize: '15px',
                                                                color: '#333',
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}>
                                                                👤 Cardholder Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="John Doe"
                                                                value={cardData.cardholderName}
                                                                onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '16px',
                                                                    border: '2px solid #E0E0E0',
                                                                    borderRadius: '12px',
                                                                    fontSize: '16px',
                                                                    boxSizing: 'border-box',
                                                                    transition: 'all 0.3s ease',
                                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                                    backdropFilter: 'blur(10px)'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {paymentMethod === 'upi' && (
                                                <div style={{ marginBottom: '24px' }}>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        fontSize: '15px',
                                                        color: '#333',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        📱 UPI ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="yourname@paytm"
                                                        value={upiId}
                                                        onChange={(e) => setUpiId(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '16px',
                                                            border: '2px solid #E0E0E0',
                                                            borderRadius: '12px',
                                                            fontSize: '16px',
                                                            boxSizing: 'border-box',
                                                            transition: 'all 0.3s ease',
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            backdropFilter: 'blur(10px)'
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {paymentMethod === 'netbanking' && (
                                                <div style={{ marginBottom: '24px' }}>
                                                    <label style={{
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        fontSize: '15px',
                                                        color: '#333',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        🏦 Select Bank
                                                    </label>
                                                    <select style={{
                                                        width: '100%',
                                                        padding: '16px',
                                                        border: '2px solid #E0E0E0',
                                                        borderRadius: '12px',
                                                        fontSize: '16px',
                                                        boxSizing: 'border-box',
                                                        transition: 'all 0.3s ease',
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        backdropFilter: 'blur(10px)'
                                                    }}>
                                                        <option>State Bank of India</option>
                                                        <option>HDFC Bank</option>
                                                        <option>ICICI Bank</option>
                                                        <option>Axis Bank</option>
                                                        <option>Kotak Mahindra Bank</option>
                                                    </select>
                                                </div>
                                            )}

                                            <button
                                                onClick={processPayment}
                                                style={{
                                                    width: '100%',
                                                    padding: '18px',
                                                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                                className="button-hover"
                                            >
                                                <span>💳</span>
                                                Pay ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L
                                                <span>🚀</span>
                                            </button>
                                        </>
                                    )}

                                    {paymentStep === 'processing' && (
                                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #FF9800, #FFC107)',
                                                padding: '20px',
                                                borderRadius: '50%',
                                                display: 'inline-block',
                                                marginBottom: '24px',
                                                animation: 'pulse 2s infinite'
                                            }}>
                                                <Clock size={48} color="white" />
                                            </div>
                                            <h3 style={{ margin: '0 0 12px', color: '#333', fontSize: '22px', fontWeight: '700' }}>
                                                ⚡ Processing Payment...
                                            </h3>
                                            <p style={{ margin: '0 0 24px', color: '#666', fontSize: '16px' }}>
                                                Please wait while we securely process your payment
                                            </p>
                                            <div style={{
                                                width: '100%',
                                                height: '12px',
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: '6px',
                                                overflow: 'hidden',
                                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <div style={{
                                                    width: `${processingProgress}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                                                    borderRadius: '6px',
                                                    transition: 'width 0.3s ease',
                                                    animation: processingProgress > 0 ? 'progressGlow 1s infinite' : 'none'
                                                }} />
                                            </div>
                                            <p style={{ margin: '16px 0 0', fontSize: '14px', color: '#666', fontWeight: '600' }}>
                                                {processingProgress}% Complete
                                            </p>
                                        </div>
                                    )}

                                    {paymentStep === 'success' && (
                                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                                                padding: '24px',
                                                borderRadius: '50%',
                                                display: 'inline-block',
                                                marginBottom: '24px',
                                                animation: 'pulse 1.5s infinite'
                                            }}>
                                                <CheckCircle size={64} color="white" />
                                            </div>
                                            <h3 style={{ margin: '0 0 12px', color: '#2E7D32', fontSize: '24px', fontWeight: '700' }}>
                                                🎉 Payment Successful!
                                            </h3>
                                            <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
                                                Your token payment has been processed successfully
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    };

    // const BookingScreen = ({ setCurrentScreen, selectedPlot, handleBookingSubmit }) => {
    //     const [formData, setFormData] = useState({
    //         fullName: 'sai',
    //         email: 'sai@example.com',
    //         phone: '9876543210',
    //         address: 'Hyderabad',
    //         occupation: 'SoftwareDeveloper',
    //         panNumber: '9876543211234',
    //         aadharNumber: '98765432028'
    //     });

    //     const handleInputChange = (field, value) => {
    //         setFormData(prev => ({ ...prev, [field]: value }));
    //     };


    //     return (
    //         <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto' }}>
    //             <div style={{
    //                 padding: '20px',
    //                 backgroundColor: '#9C27B0',
    //                 color: 'white',
    //                 display: 'flex',
    //                 alignItems: 'center',
    //                 gap: '10px'
    //             }}>
    //                 <button
    //                     onClick={() => setCurrentScreen('ventures')}
    //                     style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
    //                 >
    //                     <ArrowLeft size={24} />
    //                 </button>
    //                 <div>
    //                     <h2 style={{ margin: 0 }}>Book Your Plot</h2>
    //                     <p style={{ margin: '5px 0 0', opacity: 0.9 }}>{selectedPlot?.title || 'No plot selected'}</p>
    //                 </div>
    //             </div>

    //             <div style={{ padding: '20px' }}>
    //                 {selectedPlot && (
    //                     <div style={{
    //                         backgroundColor: '#f8f9fa',
    //                         padding: '15px',
    //                         borderRadius: '12px',
    //                         marginBottom: '20px'
    //                     }}>
    //                         <h3 style={{ margin: '0 0 10px', color: '#333' }}>Plot Details</h3>
    //                         <div style={{ fontSize: '14px', color: '#666' }}>
    //                             <div>Plot ID: {selectedPlot.id}</div>
    //                             <div>Location: {selectedPlot.location}</div>
    //                             <div>Area: {selectedPlot.area}</div>
    //                             <div>Total Price: ₹{(selectedPlot.price / 100000).toFixed(1)}L</div>
    //                             <div>Token Amount: ₹{(selectedPlot.tokenAmount / 100000).toFixed(1)}L</div>
    //                         </div>
    //                     </div>
    //                 )}

    //                 {!selectedPlot && (
    //                     <div style={{
    //                         backgroundColor: '#fff3cd',
    //                         border: '1px solid #ffeaa7',
    //                         padding: '15px',
    //                         borderRadius: '12px',
    //                         marginBottom: '20px',
    //                         textAlign: 'center'
    //                     }}>
    //                         <p style={{ margin: 0, color: '#856404' }}>No plot selected. Please go back and select a plot first.</p>
    //                     </div>
    //                 )}

    //                 <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
    //                     <div>
    //                         <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
    //                             Full Name *
    //                         </label>
    //                         <input
    //                             type="text"
    //                             value={formData.fullName}
    //                             onChange={(e) => handleInputChange('fullName', e.target.value)}
    //                             style={{
    //                                 width: '100%',
    //                                 padding: '12px',
    //                                 border: '1px solid #ddd',
    //                                 borderRadius: '8px',
    //                                 fontSize: '16px',
    //                                 boxSizing: 'border-box'
    //                             }}
    //                             placeholder="Enter your full name"
    //                         />
    //                     </div>

    //                     <div>
    //                         <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
    //                             Email Address *
    //                         </label>
    //                         <input
    //                             type="email"
    //                             value={formData.email}
    //                             onChange={(e) => handleInputChange('email', e.target.value)}
    //                             style={{
    //                                 width: '100%',
    //                                 padding: '12px',
    //                                 border: '1px solid #ddd',
    //                                 borderRadius: '8px',
    //                                 fontSize: '16px',
    //                                 boxSizing: 'border-box'
    //                             }}
    //                             placeholder="Enter your email"
    //                         />
    //                     </div>

    //                     <div>
    //                         <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
    //                             Phone Number *
    //                         </label>
    //                         <input
    //                             type="tel"
    //                             value={formData.phone}
    //                             onChange={(e) => handleInputChange('phone', e.target.value)}
    //                             style={{
    //                                 width: '100%',
    //                                 padding: '12px',
    //                                 border: '1px solid #ddd',
    //                                 borderRadius: '8px',
    //                                 fontSize: '16px',
    //                                 boxSizing: 'border-box'
    //                             }}
    //                             placeholder="Enter your phone number"
    //                         />
    //                     </div>

    //                     <div>
    //                         <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
    //                             Address
    //                         </label>
    //                         <textarea
    //                             value={formData.address}
    //                             onChange={(e) => handleInputChange('address', e.target.value)}
    //                             style={{
    //                                 width: '100%',
    //                                 padding: '12px',
    //                                 border: '1px solid #ddd',
    //                                 borderRadius: '8px',
    //                                 fontSize: '16px',
    //                                 minHeight: '80px',
    //                                 resize: 'vertical',
    //                                 boxSizing: 'border-box'
    //                             }}
    //                             placeholder="Enter your address"
    //                         />
    //                     </div>

    //                     <div>
    //                         <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
    //                             Occupation
    //                         </label>
    //                         <input
    //                             type="text"
    //                             value={formData.occupation}
    //                             onChange={(e) => handleInputChange('occupation', e.target.value)}
    //                             style={{
    //                                 width: '100%',
    //                                 padding: '12px',
    //                                 border: '1px solid #ddd',
    //                                 borderRadius: '8px',
    //                                 fontSize: '16px',
    //                                 boxSizing: 'border-box'
    //                             }}
    //                             placeholder="Enter your occupation"
    //                         />
    //                     </div>

    //                     <div>
    //                         <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
    //                             PAN Number
    //                         </label>
    //                         <input
    //                             type="text"
    //                             value={formData.panNumber}
    //                             onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
    //                             style={{
    //                                 width: '100%',
    //                                 padding: '12px',
    //                                 border: '1px solid #ddd',
    //                                 borderRadius: '8px',
    //                                 fontSize: '16px',
    //                                 boxSizing: 'border-box'
    //                             }}
    //                             placeholder="Enter PAN number"
    //                             maxLength="10"
    //                         />
    //                     </div>

    //                     <div>
    //                         <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
    //                             Aadhar Number
    //                         </label>
    //                         <input
    //                             type="text"
    //                             value={formData.aadharNumber}
    //                             onChange={(e) => handleInputChange('aadharNumber', e.target.value.replace(/\D/g, ''))}
    //                             style={{
    //                                 width: '100%',
    //                                 padding: '12px',
    //                                 border: '1px solid #ddd',
    //                                 borderRadius: '8px',
    //                                 fontSize: '16px',
    //                                 boxSizing: 'border-box'
    //                             }}
    //                             placeholder="Enter Aadhar number"
    //                             maxLength="12"
    //                         />
    //                     </div>

    //                     {/* <button
    //                         type="button"
    //                         onClick={handleBookingSubmit(false)}
    //                         disabled={!selectedPlot}
    //                         style={{
    //                             width: '100%',
    //                             padding: '15px',
    //                             backgroundColor: selectedPlot ? '#9C27B0' : '#ccc',
    //                             color: 'white',
    //                             border: 'none',
    //                             borderRadius: '8px',
    //                             fontSize: '16px',
    //                             fontWeight: 'bold',
    //                             cursor: selectedPlot ? 'pointer' : 'not-allowed',
    //                             marginTop: '20px'
    //                         }}
    //                     >
    //                         {selectedPlot ? 'Proceed to Payment' : 'Please select a plot first'}
    //                     </button> */}
    //                     <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
    //                         <button
    //                             onClick={() => handleBookingSubmit(false)}
    //                             disabled={!selectedPlot}
    //                             style={{
    //                                 flex: 1,
    //                                 padding: '15px',
    //                                 backgroundColor: selectedPlot ? '#2196F3' : '#ccc',
    //                                 color: 'white',
    //                                 border: 'none',
    //                                 borderRadius: '8px',
    //                                 fontSize: '16px',
    //                                 fontWeight: 'bold',
    //                                 cursor: selectedPlot ? 'pointer' : 'not-allowed'
    //                             }}
    //                         >
    //                             Book Site Visit
    //                         </button>

    //                         <button
    //                             onClick={() => handleBookingSubmit(true)}
    //                             disabled={!selectedPlot}
    //                             style={{
    //                                 flex: 1,
    //                                 padding: '15px',
    //                                 backgroundColor: selectedPlot ? '#4CAF50' : '#ccc',
    //                                 color: 'white',
    //                                 border: 'none',
    //                                 borderRadius: '8px',
    //                                 fontSize: '16px',
    //                                 fontWeight: 'bold',
    //                                 cursor: selectedPlot ? 'pointer' : 'not-allowed'
    //                             }}
    //                         >
    //                             Pay Token & Reserve
    //                         </button>
    //                     </div>
    //                 </form>
    //             </div>
    //         </div>
    //     );
    // };

    // const PaymentScreen = ({ setCurrentScreen, selectedPlot }) => {
    //     const [paymentMethod, setPaymentMethod] = useState('card');
    //     const [cardData, setCardData] = useState({
    //         cardNumber: '',
    //         expiryDate: '',
    //         cvv: '',
    //         cardholderName: ''
    //     });
    //     const [upiId, setUpiId] = useState('');
    //     const [showRazorpayModal, setShowRazorpayModal] = useState(false);
    //     const [paymentStep, setPaymentStep] = useState('method'); // method, processing, success
    //     const [processingProgress, setProcessingProgress] = useState(0);
    //     // const [currentScreen, setCurrentScreen] = useState('payment');
    //     const [paymentData, setPaymentData] = useState(null);



    //     const handlePaymentSuccess = () => {
    //         setPaymentData({
    //             method: paymentMethod,
    //             amount: selectedPlot.tokenAmount,
    //             transactionId: 'pay_' + Math.random().toString(36).substr(2, 9),
    //             timestamp: new Date().toISOString(),
    //         });
    //         setPaymentStep('success');
    //         setTimeout(() => {
    //             setShowRazorpayModal(false);
    //             setCurrentScreen('payment-success');
    //         }, 2000);
    //     };

    //     const handleRazorpayPayment = () => {
    //         setShowRazorpayModal(true);
    //         setPaymentStep('method');
    //     };

    //     const processPayment = () => {
    //         setPaymentStep('processing');
    //         setProcessingProgress(0);

    //         const interval = setInterval(() => {
    //             setProcessingProgress(prev => {
    //                 if (prev >= 100) {
    //                     clearInterval(interval);
    //                     handlePaymentSuccess();
    //                     return 100;
    //                 }
    //                 return prev + 10;
    //             });
    //         }, 200);
    //     };

    //     const formatCardNumber = (value) => {
    //         const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    //         const matches = v.match(/\d{4,16}/g);
    //         const match = matches && matches[0] || '';
    //         const parts = [];
    //         for (let i = 0, len = match.length; i < len; i += 4) {
    //             parts.push(match.substring(i, i + 4));
    //         }
    //         if (parts.length) {
    //             return parts.join(' ');
    //         } else {
    //             return v;
    //         }
    //     };

    //     const handleCardNumberChange = (e) => {
    //         const formatted = formatCardNumber(e.target.value);
    //         if (formatted.replace(/\s/g, '').length <= 16) {
    //             setCardData(prev => ({ ...prev, cardNumber: formatted }));
    //         }
    //     };

    //     const handleExpiryChange = (e) => {
    //         let value = e.target.value.replace(/\D/g, '');
    //         if (value.length >= 2) {
    //             value = value.substring(0, 2) + '/' + value.substring(2, 4);
    //         }
    //         setCardData(prev => ({ ...prev, expiryDate: value }));
    //     };

    //     if (currentScreen === 'payment-success') {
    //         return <PaymentSuccessScreen paymentData={paymentData} selectedPlot={selectedPlot} setCurrentScreen={setCurrentScreen} />;
    //     }

    //     return (
    //         <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
    //             <div style={{
    //                 padding: '20px',
    //                 backgroundColor: '#4CAF50',
    //                 color: 'white',
    //                 display: 'flex',
    //                 alignItems: 'center',
    //                 gap: '10px'
    //             }}>
    //                 <button
    //                     onClick={() => setCurrentScreen('booking')}
    //                     style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
    //                 >
    //                     <ArrowLeft size={24} />
    //                 </button>
    //                 <div>
    //                     <h2 style={{ margin: 0 }}>Secure Payment</h2>
    //                     <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Complete your token payment</p>
    //                 </div>
    //             </div>

    //             <div style={{ padding: '20px' }}>
    //                 {/* Payment Summary */}
    //                 <div style={{
    //                     backgroundColor: 'white',
    //                     padding: '20px',
    //                     borderRadius: '12px',
    //                     marginBottom: '20px',
    //                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    //                 }}>
    //                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
    //                         <Shield size={20} color="#4CAF50" />
    //                         <h3 style={{ margin: 0, color: '#333' }}>Payment Summary</h3>
    //                     </div>
    //                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
    //                         <span style={{ color: '#666' }}>Plot: {selectedPlot?.title}</span>
    //                     </div>
    //                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
    //                         <span style={{ color: '#666' }}>Total Price:</span>
    //                         <span>₹{(selectedPlot?.price / 100000).toFixed(1)}L</span>
    //                     </div>
    //                     <div style={{ 
    //                         display: 'flex', 
    //                         justifyContent: 'space-between', 
    //                         marginBottom: '10px', 
    //                         fontSize: '18px', 
    //                         fontWeight: 'bold', 
    //                         color: '#4CAF50',
    //                         padding: '10px',
    //                         backgroundColor: '#E8F5E8',
    //                         borderRadius: '8px'
    //                     }}>
    //                         <span>Token Amount:</span>
    //                         <span>₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L</span>
    //                     </div>
    //                     <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
    //                         <span>Remaining Amount:</span>
    //                         <span>₹{((selectedPlot?.price - selectedPlot?.tokenAmount) / 100000).toFixed(1)}L</span>
    //                     </div>
    //                 </div>

    //                 {/* Payment Button */}
    //                 <button
    //                     onClick={handleRazorpayPayment}
    //                     style={{
    //                         width: '100%',
    //                         padding: '16px',
    //                         backgroundColor: '#2196F3',
    //                         color: 'white',
    //                         border: 'none',
    //                         borderRadius: '12px',
    //                         fontSize: '16px',
    //                         fontWeight: 'bold',
    //                         cursor: 'pointer',
    //                         display: 'flex',
    //                         alignItems: 'center',
    //                         justifyContent: 'center',
    //                         gap: '12px',
    //                         boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
    //                         transition: 'transform 0.2s',
    //                     }}
    //                     onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
    //                     onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
    //                     onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    //                 >
    //                     <DollarSign size={20} />
    //                     Pay ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L Securely
    //                 </button>

    //                 <div style={{ 
    //                     textAlign: 'center', 
    //                     margin: '20px 0',
    //                     color: '#666',
    //                     fontSize: '12px',
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                     gap: '8px'
    //                 }}>
    //                     <Shield size={16} />
    //                     Secured by 256-bit SSL encryption
    //                 </div>
    //             </div>

    //             {/* Simulated Razorpay Modal */}
    //             {showRazorpayModal && (
    //                 <div style={{
    //                     position: 'fixed',
    //                     top: 0,
    //                     left: 0,
    //                     right: 0,
    //                     bottom: 0,
    //                     backgroundColor: 'rgba(0,0,0,0.7)',
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                     zIndex: 1000,
    //                     padding: '20px'
    //                 }}>
    //                     <div style={{
    //                         backgroundColor: 'white',
    //                         borderRadius: '12px',
    //                         width: '100%',
    //                         maxWidth: '400px',
    //                         maxHeight: '90vh',
    //                         overflow: 'hidden',
    //                         position: 'relative'
    //                     }}>
    //                         {/* Header */}
    //                         <div style={{
    //                             padding: '20px',
    //                             borderBottom: '1px solid #eee',
    //                             display: 'flex',
    //                             justifyContent: 'space-between',
    //                             alignItems: 'center',
    //                             backgroundColor: '#2196F3',
    //                             color: 'white'
    //                         }}>
    //                             <div>
    //                                 <h3 style={{ margin: 0, fontSize: '18px' }}>ScaleOrange Ventures</h3>
    //                                 <p style={{ margin: '5px 0 0', fontSize: '14px', opacity: 0.9 }}>
    //                                     ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L
    //                                 </p>
    //                             </div>
    //                             <button
    //                                 onClick={() => setShowRazorpayModal(false)}
    //                                 style={{
    //                                     background: 'transparent',
    //                                     border: 'none',
    //                                     color: 'white',
    //                                     cursor: 'pointer',
    //                                     padding: '5px'
    //                                 }}
    //                             >
    //                                 <X size={20} />
    //                             </button>
    //                         </div>

    //                         <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
    //                             {paymentStep === 'method' && (
    //                                 <>
    //                                     {/* Payment Methods */}
    //                                     <div style={{ marginBottom: '20px' }}>
    //                                         <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
    //                                             {[
    //                                                 { id: 'card', label: 'Card', icon: CreditCard },
    //                                                 { id: 'upi', label: 'UPI', icon: Phone },
    //                                                 { id: 'netbanking', label: 'Net Banking', icon: Building }
    //                                             ].map(({ id, label, icon: Icon }) => (
    //                                                 <button
    //                                                     key={id}
    //                                                     onClick={() => setPaymentMethod(id)}
    //                                                     style={{
    //                                                         flex: 1,
    //                                                         padding: '12px 8px',
    //                                                         border: `2px solid ${paymentMethod === id ? '#2196F3' : '#ddd'}`,
    //                                                         borderRadius: '8px',
    //                                                         backgroundColor: paymentMethod === id ? '#E3F2FD' : 'white',
    //                                                         cursor: 'pointer',
    //                                                         display: 'flex',
    //                                                         flexDirection: 'column',
    //                                                         alignItems: 'center',
    //                                                         gap: '5px',
    //                                                         fontSize: '12px'
    //                                                     }}
    //                                                 >
    //                                                     <Icon size={18} color={paymentMethod === id ? '#2196F3' : '#666'} />
    //                                                     {label}
    //                                                 </button>
    //                                             ))}
    //                                         </div>
    //                                     </div>

    //                                     {/* Payment Forms */}
    //                                     {paymentMethod === 'card' && (
    //                                         <div style={{ marginBottom: '20px' }}>
    //                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
    //                                                 <div>
    //                                                     <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
    //                                                         Card Number
    //                                                     </label>
    //                                                     <input
    //                                                         type="text"
    //                                                         placeholder="1234 5678 9012 3456"
    //                                                         value={cardData.cardNumber}
    //                                                         onChange={handleCardNumberChange}
    //                                                         style={{
    //                                                             width: '100%',
    //                                                             padding: '12px',
    //                                                             border: '1px solid #ddd',
    //                                                             borderRadius: '6px',
    //                                                             fontSize: '16px',
    //                                                             boxSizing: 'border-box'
    //                                                         }}
    //                                                     />
    //                                                 </div>
    //                                                 <div style={{ display: 'flex', gap: '10px' }}>
    //                                                     <div style={{ flex: 1 }}>
    //                                                         <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
    //                                                             Expiry
    //                                                         </label>
    //                                                         <input
    //                                                             type="text"
    //                                                             placeholder="MM/YY"
    //                                                             value={cardData.expiryDate}
    //                                                             onChange={handleExpiryChange}
    //                                                             maxLength="5"
    //                                                             style={{
    //                                                                 width: '100%',
    //                                                                 padding: '12px',
    //                                                                 border: '1px solid #ddd',
    //                                                                 borderRadius: '6px',
    //                                                                 fontSize: '16px',
    //                                                                 boxSizing: 'border-box'
    //                                                             }}
    //                                                         />
    //                                                     </div>
    //                                                     <div style={{ flex: 1 }}>
    //                                                         <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
    //                                                             CVV
    //                                                         </label>
    //                                                         <input
    //                                                             type="text"
    //                                                             placeholder="123"
    //                                                             value={cardData.cvv}
    //                                                             onChange={(e) => {
    //                                                                 const value = e.target.value.replace(/\D/g, '');
    //                                                                 if (value.length <= 3) {
    //                                                                     setCardData(prev => ({ ...prev, cvv: value }));
    //                                                                 }
    //                                                             }}
    //                                                             style={{
    //                                                                 width: '100%',
    //                                                                 padding: '12px',
    //                                                                 border: '1px solid #ddd',
    //                                                                 borderRadius: '6px',
    //                                                                 fontSize: '16px',
    //                                                                 boxSizing: 'border-box'
    //                                                             }}
    //                                                         />
    //                                                     </div>
    //                                                 </div>
    //                                                 <div>
    //                                                     <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
    //                                                         Cardholder Name
    //                                                     </label>
    //                                                     <input
    //                                                         type="text"
    //                                                         placeholder="John Doe"
    //                                                         value={cardData.cardholderName}
    //                                                         onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
    //                                                         style={{
    //                                                             width: '100%',
    //                                                             padding: '12px',
    //                                                             border: '1px solid #ddd',
    //                                                             borderRadius: '6px',
    //                                                             fontSize: '16px',
    //                                                             boxSizing: 'border-box'
    //                                                         }}
    //                                                     />
    //                                                 </div>
    //                                             </div>
    //                                         </div>
    //                                     )}

    //                                     {paymentMethod === 'upi' && (
    //                                         <div style={{ marginBottom: '20px' }}>
    //                                             <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
    //                                                 UPI ID
    //                                             </label>
    //                                             <input
    //                                                 type="text"
    //                                                 placeholder="yourname@paytm"
    //                                                 value={upiId}
    //                                                 onChange={(e) => setUpiId(e.target.value)}
    //                                                 style={{
    //                                                     width: '100%',
    //                                                     padding: '12px',
    //                                                     border: '1px solid #ddd',
    //                                                     borderRadius: '6px',
    //                                                     fontSize: '16px',
    //                                                     boxSizing: 'border-box'
    //                                                 }}
    //                                             />
    //                                         </div>
    //                                     )}

    //                                     {paymentMethod === 'netbanking' && (
    //                                         <div style={{ marginBottom: '20px' }}>
    //                                             <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
    //                                                 Select Bank
    //                                             </label>
    //                                             <select style={{
    //                                                 width: '100%',
    //                                                 padding: '12px',
    //                                                 border: '1px solid #ddd',
    //                                                 borderRadius: '6px',
    //                                                 fontSize: '16px',
    //                                                 boxSizing: 'border-box'
    //                                             }}>
    //                                                 <option>State Bank of India</option>
    //                                                 <option>HDFC Bank</option>
    //                                                 <option>ICICI Bank</option>
    //                                                 <option>Axis Bank</option>
    //                                                 <option>Kotak Mahindra Bank</option>
    //                                             </select>
    //                                         </div>
    //                                     )}

    //                                     <button
    //                                         onClick={processPayment}
    //                                         style={{
    //                                             width: '100%',
    //                                             padding: '15px',
    //                                             backgroundColor: '#4CAF50',
    //                                             color: 'white',
    //                                             border: 'none',
    //                                             borderRadius: '8px',
    //                                             fontSize: '16px',
    //                                             fontWeight: 'bold',
    //                                             cursor: 'pointer'
    //                                         }}
    //                                     >
    //                                         Pay ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L
    //                                     </button>
    //                                 </>
    //                             )}

    //                             {paymentStep === 'processing' && (
    //                                 <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    //                                     <Clock size={48} color="#FF9800" style={{ marginBottom: '20px' }} />
    //                                     <h3 style={{ margin: '0 0 10px', color: '#333' }}>Processing Payment...</h3>
    //                                     <p style={{ margin: '0 0 20px', color: '#666' }}>Please wait while we process your payment</p>
    //                                     <div style={{
    //                                         width: '100%',
    //                                         height: '8px',
    //                                         backgroundColor: '#f0f0f0',
    //                                         borderRadius: '4px',
    //                                         overflow: 'hidden'
    //                                     }}>
    //                                         <div style={{
    //                                             width: `${processingProgress}%`,
    //                                             height: '100%',
    //                                             backgroundColor: '#4CAF50',
    //                                             borderRadius: '4px',
    //                                             transition: 'width 0.3s ease'
    //                                         }} />
    //                                     </div>
    //                                     <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#666' }}>
    //                                         {processingProgress}% Complete
    //                                     </p>
    //                                 </div>
    //                             )}

    //                             {paymentStep === 'success' && (
    //                                 <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    //                                     <CheckCircle size={64} color="#4CAF50" style={{ marginBottom: '20px' }} />
    //                                     <p style={{ margin: '0', color: '#666' }}>Your token payment has been processed</p>
    //                                 </div>
    //                             )}
    //                         </div>
    //                     </div>
    //                 </div>
    //             )}
    //         </div>
    //     );
    // };


    const PaymentSuccessScreen = ({ setCurrentScreen, paymentData, selectedPlot }) => {
        const [selectedDate, setSelectedDate] = useState('');
        const [showConfetti, setShowConfetti] = useState(true);
        const [currentStep, setCurrentStep] = useState('success'); // success, scheduling, scheduled

        useEffect(() => {
            // Hide confetti after 4 seconds
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }, []);

        useEffect(() => {
            if (currentStep === 'scheduled') {
                // After scheduled, transition to ventures
                const timer = setTimeout(() => setCurrentScreen('ventures'), 3000);
                return () => clearTimeout(timer);
            }
        }, [currentStep, setCurrentScreen]);
        const handleDateSelection = () => {
            if (!selectedDate) {
                alert('Please select a payment date');
                return;
            }
            setCurrentStep('scheduled');

            // Auto-transition to ventures screen after celebration
            setTimeout(() => {
                setCurrentScreen('ventures');
            }, 3000);
        };

        const remainingAmount = selectedPlot?.price - selectedPlot?.tokenAmount;

        // Success celebration screen
        if (currentStep === 'success') {
            return (
                <div style={{
                    height: '100vh',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 50%, #A5D6A7 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Confetti Animation */}
                    {showConfetti && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                            zIndex: 1
                        }}>
                            {[...Array(30)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        left: `${Math.random() * 100}%`,
                                        width: `${8 + Math.random() * 6}px`,
                                        height: `${8 + Math.random() * 6}px`,
                                        background: `hsl(${Math.random() * 360}, 80%, 65%)`,
                                        borderRadius: Math.random() > 0.5 ? '50%' : '0',
                                        animation: `confettiFall ${3 + Math.random() * 2}s linear infinite`,
                                        animationDelay: `${Math.random() * 3}s`,
                                        transform: `rotate(${Math.random() * 360}deg)`
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Floating elements */}
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        left: '10%',
                        fontSize: '40px',
                        animation: 'float 3s ease-in-out infinite',
                        animationDelay: '0s'
                    }}>💰</div>
                    <div style={{
                        position: 'absolute',
                        top: '30%',
                        right: '15%',
                        fontSize: '35px',
                        animation: 'float 3s ease-in-out infinite',
                        animationDelay: '1s'
                    }}>✨</div>
                    <div style={{
                        position: 'absolute',
                        bottom: '25%',
                        left: '20%',
                        fontSize: '30px',
                        animation: 'float 3s ease-in-out infinite',
                        animationDelay: '2s'
                    }}>🎉</div>

                    {/* Main Success Content */}
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2,
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {/* Success Icon */}
                        <div style={{
                            width: '120px',
                            height: '120px',
                            background: 'rgba(255,255,255,0.25)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 30px',
                            animation: 'successBounce 2s ease infinite',
                            backdropFilter: 'blur(10px)',
                            border: '3px solid rgba(255,255,255,0.3)'
                        }}>
                            <CheckCircle size={60} color="white" />
                        </div>

                        <h1 style={{
                            margin: '0 0 15px',
                            color: 'white',
                            fontSize: '36px',
                            fontWeight: '900',
                            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            animation: 'slideUpFade 1s ease',
                            letterSpacing: '1px'
                        }}>
                            Payment Successful! 🎊
                        </h1>

                        <p style={{
                            margin: '0 0 40px',
                            color: 'rgba(255,255,255,0.95)',
                            fontSize: '20px',
                            animation: 'slideUpFade 1.2s ease',
                            fontWeight: '500'
                        }}>
                            Your token payment is confirmed
                        </p>

                        {/* Amount Display */}
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(15px)',
                            padding: '30px',
                            borderRadius: '25px',
                            marginBottom: '40px',
                            animation: 'slideUpFade 1.4s ease',
                            border: '2px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                fontWeight: '900',
                                color: 'white',
                                marginBottom: '10px',
                                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                            }}>
                                ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L
                            </div>
                            <div style={{
                                fontSize: '16px',
                                color: 'rgba(255,255,255,0.8)',
                                fontWeight: '600'
                            }}>
                                Token Amount Paid
                            </div>
                        </div>

                        <button
                            onClick={() => setCurrentStep('scheduling')}
                            style={{
                                padding: '20px 40px',
                                background: 'rgba(255,255,255,0.95)',
                                color: '#4CAF50',
                                border: 'none',
                                borderRadius: '50px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease',
                                animation: 'slideUpFade 1.6s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                                e.target.style.boxShadow = '0 20px 45px rgba(0,0,0,0.25)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
                            }}
                        >
                            Schedule Remaining Payment
                        </button>
                    </div>

                    <style jsx>{`
                        @keyframes successBounce {
                            0%, 20%, 53%, 80%, 100% {
                                transform: translate3d(0,0,0) scale(1);
                            }
                            40%, 43% {
                                transform: translate3d(0, -20px, 0) scale(1.1);
                            }
                            70% {
                                transform: translate3d(0, -10px, 0) scale(1.05);
                            }
                            90% {
                                transform: translate3d(0, -4px, 0) scale(1.02);
                            }
                        }
                        
                        @keyframes slideUpFade {
                            from {
                                opacity: 0;
                                transform: translateY(40px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        
                        @keyframes confettiFall {
                            to {
                                transform: translateY(100vh) rotate(720deg);
                            }
                        }
                        
                        @keyframes float {
                            0%, 100% {
                                transform: translateY(0px) rotate(0deg);
                            }
                            50% {
                                transform: translateY(-20px) rotate(10deg);
                            }
                        }
                    `}</style>
                </div>
            );
        }

        // Scheduling screen
        if (currentStep === 'scheduling') {
            return (
                <div style={{
                    height: '100vh',
                    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 50%, #FFCC02 100%)',
                    paddingBottom: '20px',
                    overflowY: 'auto',
                    position: 'relative'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '30px 20px',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            animation: 'pulse 2s infinite'
                        }}>
                            <Clock size={40} color="white" />
                        </div>
                        <h1 style={{
                            margin: '0 0 10px',
                            color: 'white',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            textShadow: '0 2px 15px rgba(0,0,0,0.3)'
                        }}>
                            Schedule Remaining Payment
                        </h1>
                        <p style={{
                            margin: 0,
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '16px'
                        }}>
                            Choose your preferred payment date
                        </p>
                    </div>

                    <div style={{ padding: '20px' }}>
                        {/* Payment Summary */}
                        <div style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            padding: '25px',
                            borderRadius: '20px',
                            marginBottom: '25px',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                            animation: 'slideUpFade 0.6s ease'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'linear-gradient(135deg, #FF9800, #FFCC02)',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <DollarSign size={24} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, color: '#FF9800', fontSize: '20px' }}>
                                        Remaining Payment
                                    </h3>
                                    <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
                                        Complete your plot purchase
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '15px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    padding: '15px',
                                    background: 'linear-gradient(135deg, #4CAF5015, #81C78415)',
                                    borderRadius: '12px',
                                    border: '2px solid #4CAF5020',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>✅ Paid</div>
                                    <div style={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '16px' }}>
                                        ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L
                                    </div>
                                </div>
                                <div style={{
                                    padding: '15px',
                                    background: 'linear-gradient(135deg, #FF980015, #FFCC0215)',
                                    borderRadius: '12px',
                                    border: '2px solid #FF980020',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>⏳ Due</div>
                                    <div style={{ fontWeight: 'bold', color: '#FF9800', fontSize: '16px' }}>
                                        ₹{(remainingAmount / 100000).toFixed(1)}L
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                                    🏡 {selectedPlot?.title}
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>
                                    Total: ₹{(selectedPlot?.price / 100000).toFixed(1)}L
                                </div>
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            padding: '25px',
                            borderRadius: '20px',
                            marginBottom: '25px',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                            animation: 'slideUpFade 0.8s ease'
                        }}>
                            <h3 style={{
                                margin: '0 0 20px',
                                color: '#333',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                📅 Select Payment Date
                            </h3>

                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    border: '3px solid #FF9800',
                                    borderRadius: '15px',
                                    fontSize: '16px',
                                    marginBottom: '20px',
                                    boxSizing: 'border-box',
                                    background: 'white',
                                    transition: 'all 0.3s ease'
                                }}
                            />

                            <div style={{
                                padding: '15px',
                                background: 'linear-gradient(135deg, #FF980010, #FFCC0210)',
                                borderRadius: '12px',
                                fontSize: '14px',
                                color: '#856404',
                                border: '1px solid #FF980020'
                            }}>
                                💡 <strong>Tip:</strong> Choose a date that works best for you. We'll send you a reminder notification.
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleDateSelection}
                            disabled={!selectedDate}
                            style={{
                                width: '100%',
                                padding: '20px',
                                background: selectedDate
                                    ? 'linear-gradient(135deg, #FF9800, #FFCC02)'
                                    : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '15px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: selectedDate ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                boxShadow: selectedDate
                                    ? '0 15px 35px rgba(255, 152, 0, 0.3)'
                                    : 'none',
                                transition: 'all 0.3s ease',
                                animation: 'slideUpFade 1s ease'
                            }}
                            onMouseOver={(e) => {
                                if (selectedDate) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 20px 45px rgba(255, 152, 0, 0.4)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (selectedDate) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 15px 35px rgba(255, 152, 0, 0.3)';
                                }
                            }}
                        >
                            Confirm Payment Schedule
                        </button>
                    </div>

                    <style jsx>{`
                        @keyframes pulse {
                            0%, 100% {
                                transform: scale(1);
                            }
                            50% {
                                transform: scale(1.1);
                            }
                        }
                        
                        @keyframes slideUpFade {
                            from {
                                opacity: 0;
                                transform: translateY(30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    `}</style>
                </div>
            );
        }

        // Scheduled confirmation screen
        return (
            <div style={{
                height: '100vh',
                background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 50%, #90CAF9 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Success particles */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: '6px',
                            height: '6px',
                            background: 'rgba(255,255,255,0.8)',
                            borderRadius: '50%',
                            animation: `twinkle ${2 + Math.random() * 2}s linear infinite`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}

                <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 2,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255,255,255,0.25)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 30px',
                        animation: 'successPulse 2s ease infinite',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ fontSize: '48px' }}>✅</div>
                    </div>

                    <h1 style={{
                        margin: '0 0 15px',
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: '900',
                        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        animation: 'slideUpFade 0.8s ease'
                    }}>
                        Perfect! 🎯
                    </h1>

                    <p style={{
                        margin: '0 0 30px',
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: '18px',
                        animation: 'slideUpFade 1s ease'
                    }}>
                        Your payment is scheduled for
                    </p>

                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(15px)',
                        padding: '25px',
                        borderRadius: '20px',
                        marginBottom: '40px',
                        animation: 'slideUpFade 1.2s ease',
                        border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '10px'
                        }}>
                            {new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        <div style={{
                            fontSize: '16px',
                            color: 'rgba(255,255,255,0.8)'
                        }}>
                            Amount: ₹{(remainingAmount / 100000).toFixed(1)}L
                        </div>
                    </div>

                    <p style={{
                        margin: '0 0 30px',
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '16px',
                        animation: 'slideUpFade 1.4s ease',
                        maxWidth: '300px',
                        lineHeight: '1.5'
                    }}>
                        We'll send you a reminder notification before the payment date.
                        Redirecting to appointment booking...
                    </p>

                    <div style={{
                        animation: 'slideUpFade 1.6s ease',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '14px'
                    }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid rgba(255,255,255,0.5)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        Getting back to ventures...
                    </div>
                </div>

                <style jsx>{`
                    @keyframes successPulse {
                        0%, 100% {
                            transform: scale(1);
                            box-shadow: 0 0 20px rgba(255,255,255,0.3);
                        }
                        50% {
                            transform: scale(1.05);
                            box-shadow: 0 0 30px rgba(255,255,255,0.5);
                        }
                    }
                    
                    @keyframes slideUpFade {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes twinkle {
                        0%, 100% {
                            opacity: 0.3;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.2);
                        }
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
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
                        onClick={() => setCurrentScreen('booking')}
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
                            <Calendar
                                onChange={(date) =>
                                    setAppointmentForm(prev => ({
                                        ...prev,
                                        date: new Date(date).toISOString().split('T')[0]
                                    }))
                                }
                                value={appointmentForm.date ? new Date(appointmentForm.date) : new Date()}
                                minDate={new Date()}
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

    // Enhanced Appointment Success Screen
    const AppointmentSuccessScreen = () => {
        const [showConfetti, setShowConfetti] = useState(true);

        useEffect(() => {
            // Hide confetti after 3 seconds
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }, []);

        return (
            <div style={{
                height: '100vh',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Confetti Animation */}
                {showConfetti && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 1
                    }}>
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: `${Math.random() * 100}%`,
                                    width: '10px',
                                    height: '10px',
                                    background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                                    animation: `confettiFall ${2 + Math.random() * 3}s linear infinite`,
                                    animationDelay: `${Math.random() * 2}s`
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Success Header */}
                <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        animation: 'bounce 2s infinite',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ fontSize: '48px' }}>✅</div>
                    </div>
                    <h1 style={{
                        margin: '0 0 10px',
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: '800',
                        textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                        animation: 'slideUp 0.8s ease'
                    }}>
                        Awesome! 🎉
                    </h1>
                    <p style={{
                        margin: 0,
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '18px',
                        animation: 'slideUp 1s ease'
                    }}>
                        Your appointment is confirmed!
                    </p>
                </div>

                {/* Content */}
                <div style={{
                    padding: '0 20px 20px',
                    height: 'calc(100vh - 200px)',
                    overflowY: 'auto',
                    position: 'relative',
                    zIndex: 2
                }}>
                    {/* Appointment Details Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        padding: '30px',
                        borderRadius: '25px',
                        marginBottom: '20px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                        animation: 'slideUp 0.6s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: '25px'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px'
                            }}>
                                📅
                            </div>
                            <div>
                                <h2 style={{
                                    margin: 0,
                                    color: '#11998e',
                                    fontSize: '22px',
                                    fontWeight: 'bold'
                                }}>
                                    Appointment Confirmed
                                </h2>
                                <p style={{
                                    margin: '5px 0 0',
                                    color: '#666',
                                    fontSize: '16px'
                                }}>
                                    We're excited to meet you!
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                padding: '20px',
                                background: 'linear-gradient(135deg, #11998e15, #38ef7d15)',
                                borderRadius: '15px',
                                border: '2px solid #11998e20'
                            }}>
                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>📅 Date</div>
                                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
                                    {new Date(appointmentData.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div style={{
                                padding: '20px',
                                background: 'linear-gradient(135deg, #11998e15, #38ef7d15)',
                                borderRadius: '15px',
                                border: '2px solid #11998e20'
                            }}>
                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>⏰ Time</div>
                                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
                                    {appointmentData.time}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, #11998e10, #38ef7d10)',
                            borderRadius: '15px',
                            marginBottom: '15px'
                        }}>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🎯 Purpose</div>
                            <div style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
                                {appointmentData.purpose?.replace('-', ' ').toUpperCase()}
                            </div>
                        </div>

                        <div style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, #11998e10, #38ef7d10)',
                            borderRadius: '15px'
                        }}>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🏡 Plot Details</div>
                            <div style={{ fontWeight: 'bold', color: '#333', fontSize: '16px', marginBottom: '5px' }}>
                                {appointmentData.plot?.title}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>
                                📍 {appointmentData.plot?.location}
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        padding: '25px',
                        borderRadius: '20px',
                        marginBottom: '20px',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                        animation: 'slideUp 0.8s ease'
                    }}>
                        <h3 style={{
                            margin: '0 0 15px',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            💡 Important Reminders
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                '🆔 Please bring a valid ID proof',
                                '📞 Our team will contact you 1 day before',
                                '⏱️ Site visit duration: 1-2 hours',
                                '🔄 Call us for any changes needed'
                            ].map((note, index) => (
                                <div key={index} style={{
                                    padding: '12px 15px',
                                    background: '#f8f9fa',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    color: '#333',
                                    border: '1px solid #e9ecef'
                                }}>
                                    {note}
                                </div>
                            ))}
                        </div>
                    </div>

                    /* Contact Info */
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        padding: '25px',
                        borderRadius: '20px',
                        marginBottom: '20px',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                        animation: 'slideUp 1s ease'
                    }}>
                        <h3 style={{
                            margin: '0 0 15px',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            📞 Contact Information
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '12px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px'
                                }}>
                                    📱
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>Sales Manager</div>
                                    <div style={{ color: '#666', fontSize: '14px' }}>+91 98765 43210</div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '12px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px'
                                }}>
                                    ✉️
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>Email Support</div>
                                    <div style={{ color: '#666', fontSize: '14px' }}>support@dreamplots.com</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px',
                        animation: 'slideUp 1.2s ease'
                    }}>
                        <button
                            onClick={() => {
                                const appointmentDetails = `
Appointment Confirmation
━━━━━━━━━━━━━━━━━━━━
📅 Date: ${new Date(appointmentData.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
⏰ Time: ${appointmentData.time}
🎯 Purpose: ${appointmentData.purpose?.replace('-', ' ').toUpperCase()}
🏡 Plot: ${appointmentData.plot?.title}
📍 Location: ${appointmentData.plot?.location}
👤 Customer: ${appointmentData.customerName}

Contact: +91 98765 43210
Email: support@dreamplots.com

Thank you for choosing DreamPlots!
                            `.trim();

                                navigator.share?.({
                                    title: 'Appointment Confirmation',
                                    text: appointmentDetails
                                }) || (() => {
                                    navigator.clipboard.writeText(appointmentDetails);
                                    // Show copied notification
                                    const notification = document.createElement('div');
                                    notification.innerHTML = '📋 Copied to clipboard!';
                                    notification.style.cssText = `
                                    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                                    background: linear-gradient(135deg, #11998e, #38ef7d);
                                    color: white; padding: 12px 24px; border-radius: 25px;
                                    box-shadow: 0 10px 30px rgba(17,153,142,0.3);
                                    z-index: 10000; font-weight: bold; animation: slideDown 0.3s ease;
                                `;
                                    document.body.appendChild(notification);
                                    setTimeout(() => notification.remove(), 3000);
                                })();
                            }}
                            style={{
                                padding: '18px',
                                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '15px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 10px 30px rgba(17,153,142,0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 15px 40px rgba(17,153,142,0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 10px 30px rgba(17,153,142,0.3)';
                            }}
                        >
                            📤 Share Appointment Details
                        </button>

                        <button
                            onClick={() => {
                                // Reset all forms and go back to main screen
                                setBookingData({
                                    fullName: '',
                                    email: '',
                                    phone: '',
                                    budget: '',
                                    preferences: ''
                                });
                                setAppointmentForm({
                                    date: '',
                                    time: '',
                                    purpose: 'site-visit',
                                    notes: ''
                                });
                                setSelectedPlot(null);
                                setCurrentScreen('main');
                            }}
                            style={{
                                padding: '16px',
                                background: 'rgba(255,255,255,0.9)',
                                color: '#11998e',
                                border: '2px solid #11998e',
                                borderRadius: '15px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = '#11998e';
                                e.target.style.color = 'white';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.9)';
                                e.target.style.color = '#11998e';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            🏠 Back to Home
                        </button>
                    </div>
                </div>

                <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% {
                        transform: translate3d(0,0,0);
                    }
                    40%, 43% {
                        transform: translate3d(0, -30px, 0);
                    }
                    70% {
                        transform: translate3d(0, -15px, 0);
                    }
                    90% {
                        transform: translate3d(0, -4px, 0);
                    }
                }
                
                @keyframes confettiFall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                    }
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `}</style>
            </div>
        );
    };

    const MyBookingsScreen = ({ setCurrentScreen }) => {
        // Hardcoded bookings data
        const bookings = [
            {
                plotId: "SO001",
                title: "Premium Villa Plot - Gachibowli",
                location: "Gachibowli, Hyderabad",
                tokenAmount: 850000,
                status: "Confirmed",
                date: "2025-07-01",
            },
            {
                plotId: "SO005",
                title: "Industrial Plot - Near Siddipet Projects",
                location: "Siddipet, Telangana",
                tokenAmount: 1500000,
                status: "Pending",
                date: "2025-07-10",
            },
        ];

        const containerStyle = {
            maxWidth: 650,
            margin: "40px auto",
            padding: 32,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 24,
            boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3), 0 8px 25px rgba(0, 0, 0, 0.1)",
            position: "relative",
            overflow: "hidden",
            animation: "slideIn 0.6s ease-out",
        };

        const overlayStyle = {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 24,
        };

        const contentStyle = {
            position: "relative",
            zIndex: 1,
        };

        const backButtonStyle = {
            background: "linear-gradient(135deg, #9C27B0, #E91E63)",
            border: "none",
            color: "white",
            fontWeight: "600",
            fontSize: 16,
            padding: "12px 20px",
            borderRadius: 50,
            cursor: "pointer",
            marginBottom: 24,
            boxShadow: "0 4px 15px rgba(156, 39, 176, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
        };

        const titleStyle = {
            background: "linear-gradient(135deg, #9C27B0, #E91E63)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: 28,
            fontWeight: "700",
            marginBottom: 32,
            textAlign: "center",
            animation: "fadeInUp 0.8s ease-out 0.2s both",
        };

        const bookingCardStyle = (index) => ({
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            animation: `slideInCard 0.6s ease-out ${0.3 + index * 0.1}s both`,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
        });

        const emptyStateStyle = {
            marginTop: 60,
            textAlign: "center",
            animation: "fadeIn 1s ease-out 0.5s both",
        };

        const statusColors = {
            Confirmed: {
                color: "#10B981",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
            },
            Pending: {
                color: "#F59E0B",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
            },
        };

        const statusBadgeStyle = (status) => ({
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: "600",
            marginTop: 12,
            ...statusColors[status],
        });

        // Add CSS animations
        const keyframes = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
    
            @keyframes slideInCard {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
    
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
    
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
    
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
    
            .booking-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            }
    
            .back-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);
            }
    
            .back-button:active {
                transform: translateY(0);
            }
    
            .shimmer::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: shimmer 2s infinite;
            }
    
            @keyframes shimmer {
                0% {
                    left: -100%;
                }
                100% {
                    left: 100%;
                }
            }
    
            .floating-elements::before,
            .floating-elements::after {
                content: '';
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                animation: float 6s ease-in-out infinite;
            }
    
            .floating-elements::before {
                width: 60px;
                height: 60px;
                top: 20%;
                right: 10%;
                animation-delay: -2s;
            }
    
            .floating-elements::after {
                width: 40px;
                height: 40px;
                bottom: 20%;
                left: 15%;
                animation-delay: -4s;
            }
    
            @keyframes float {
                0%, 100% {
                    transform: translateY(0px);
                }
                50% {
                    transform: translateY(-20px);
                }
            }
        `;

        return (
            <>
                <style>{keyframes}</style>
                <div style={containerStyle} className="floating-elements">
                    <div style={overlayStyle}></div>
                    <div style={contentStyle}>
                        <button
                            onClick={() => setCurrentScreen("maps")}
                            style={backButtonStyle}
                            className="back-button"
                        >
                            <span style={{ fontSize: 20 }}>←</span>
                            Back to Map
                        </button>

                        <h2 style={titleStyle}>
                            🗒️ My Bookings
                        </h2>

                        {bookings.length === 0 ? (
                            <div style={emptyStateStyle}>
                                <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.6 }}>📋</div>
                                <div style={{ color: "#666", fontSize: 18, fontWeight: "500" }}>
                                    You have no plot bookings yet.
                                </div>
                                <div style={{ color: "#999", fontSize: 14, marginTop: 8 }}>
                                    Start exploring plots on the map to make your first booking!
                                </div>
                            </div>
                        ) : (
                            <div>
                                {bookings.map((b, i) => (
                                    <div
                                        key={i}
                                        style={bookingCardStyle(i)}
                                        className="booking-card shimmer"
                                    >
                                        <div style={{
                                            fontWeight: "700",
                                            fontSize: 18,
                                            color: "#1a1a1a",
                                            marginBottom: 8,
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            backgroundClip: "text",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}>
                                            {b.title}
                                        </div>

                                        <div style={{
                                            color: "#666",
                                            fontSize: 15,
                                            marginBottom: 12,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                        }}>
                                            <span style={{ fontSize: 16 }}>📍</span>
                                            {b.location}
                                        </div>

                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 12,
                                        }}>
                                            <div style={{ fontSize: 14, color: "#555", fontWeight: "500" }}>
                                                📅 Booking Date: <span style={{ color: "#333" }}>{b.date}</span>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: 16,
                                        }}>
                                            <div style={{ fontSize: 16, color: "#333", fontWeight: "600" }}>
                                                💰 Token Amount: {" "}
                                                <span style={{
                                                    color: "#E53E3E",
                                                    fontWeight: "700",
                                                    fontSize: 18,
                                                }}>
                                                    ₹{(b.tokenAmount / 100000).toFixed(1)}L
                                                </span>
                                            </div>

                                            <div style={statusBadgeStyle(b.status)}>
                                                {b.status === "Confirmed" ? "✅" : "⏳"} {b.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    // const MyBookingsScreen = ({ setCurrentScreen }) => {
    //     // Hardcoded bookings data
    //     const bookings = [
    //         {
    //             plotId: "SO001",
    //             title: "Premium Villa Plot - Gachibowli",
    //             location: "Gachibowli, Hyderabad",
    //             tokenAmount: 850000,
    //             status: "Confirmed",
    //             date: "2025-07-01",
    //         },
    //         {
    //             plotId: "SO005",
    //             title: "Industrial Plot - Near Siddipet Projects",
    //             location: "Siddipet, Telangana",
    //             tokenAmount: 1500000,
    //             status: "Pending",
    //             date: "2025-07-10",
    //         },
    //     ];

    //     return (
    //         <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee" }}>
    //             <button
    //                 onClick={() => setCurrentScreen("maps")}
    //                 style={{ background: "none", border: "none", color: "#9C27B0", fontWeight: "bold", fontSize: 18, marginBottom: 12, cursor: "pointer" }}
    //             >
    //                 ← Back to Map
    //             </button>
    //             <h2 style={{ color: "#9C27B0" }}>🗒️ My Bookings</h2>
    //             {bookings.length === 0 ? (
    //                 <div style={{ marginTop: 40, color: "#888", textAlign: "center" }}>You have no plot bookings yet.</div>
    //             ) : (
    //                 <div style={{ marginTop: 24 }}>
    //                     {bookings.map((b, i) => (
    //                         <div key={i} style={{ border: "1px solid #eee", borderRadius: 8, padding: 18, marginBottom: 18 }}>
    //                             <div style={{ fontWeight: "bold", fontSize: 16 }}>{b.title}</div>
    //                             <div style={{ color: "#666", fontSize: 14, margin: "6px 0" }}>📍 {b.location}</div>
    //                             <div style={{ fontSize: 13, color: "#444" }}>Booking Date: {b.date}</div>
    //                             <div style={{ fontSize: 13, color: "#444" }}>
    //                                 Token Amount: <span style={{ color: "#FF5722", fontWeight: "bold" }}>₹{(b.tokenAmount / 100000).toFixed(1)}L</span>
    //                             </div>
    //                             <div style={{ fontSize: 13, color: b.status === "Confirmed" ? "#4caf50" : "#ff9800", fontWeight: "bold", marginTop: 6 }}>
    //                                 Status: {b.status}
    //                             </div>
    //                         </div>
    //                     ))}
    //                 </div>
    //             )}
    //         </div>
    //     );
    // };
    // Main render logic
    const renderCurrentScreen = () => {
        switch (currentScreen) {
            case 'home':
                return (
                    <HomeScreen
                        setCurrentScreen={setCurrentScreen}
                        setMapCenter={setMapCenter}
                        setSelectedLocation={setSelectedLocation}
                    />
                );
            case 'maps': return (
                <MapsScreen
                    setCurrentScreen={setCurrentScreen}
                    selectedPlot={selectedPlot}
                    setSelectedPlot={setSelectedPlot}
                    plotStatuses={plotStatuses}
                    setPlotStatuses={setPlotStatuses}
                    selectedSubPlot={selectedSubPlot}
                    setSelectedSubPlot={setSelectedSubPlot}
                    handleSubPlotClick={handleSubPlotClick}
                    mapCenter={mapCenter} // Pass the selected map center
                    selectedLocation={selectedLocation} // Pass the selected location data
                />

            );
            case 'ventures': return <SOVenturesApp />;
            case 'booking': return (
                <BookingScreen
                    setCurrentScreen={setCurrentScreen}
                    selectedPlot={selectedPlot}
                    handleBookingSubmit={handleBookingSubmit} // Pass the handler
                />
            );
            case 'payment': return <PaymentScreen setCurrentScreen={setCurrentScreen} selectedPlot={selectedPlot} />;
            case 'payment-success': return <PaymentSuccessScreen setCurrentScreen={setCurrentScreen} selectedPlot={selectedPlot} />;
            case 'appointment': return <AppointmentScreen />;
            case 'appointment-success': return <AppointmentSuccessScreen />;
            case 'mybookings': return <MyBookingsScreen
                setCurrentScreen={setCurrentScreen} />
            default: return <HomeScreen
                setCurrentScreen={setCurrentScreen}
                setMapCenter={setMapCenter}
                setSelectedLocation={setSelectedLocation}
            />;
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {renderCurrentScreen()}
        </div>
    );

}