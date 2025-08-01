
import { MapPin, Home, FileText, DollarSign, Clock, CheckCircle, Building, Phone, Mail, User, CreditCard, Grid, Eye, ArrowLeft, IndianRupee, Shield, X } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
export const PaymentScreen = (currentScreen,setCurrentScreen,selectedPlot,bookingData,setBookingData,handlePaymentSuccess) => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
    });
    const [upiId, setUpiId] = useState('');
    const [showRazorpayModal, setShowRazorpayModal] = useState(false);
    const [paymentStep, setPaymentStep] = useState('method'); // method, processing, success
    const [processingProgress, setProcessingProgress] = useState(0);
    const [paymentData, setPaymentData] = useState(null);


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

    if (currentScreen === 'payment-success') {
        return <PaymentSuccessScreen paymentData={paymentData} selectedPlot={selectedPlot} setCurrentScreen={setCurrentScreen} />;
    }

    return (
        <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
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
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 style={{ margin: 0 }}>Secure Payment</h2>
                    <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Complete your token payment</p>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                {/* Payment Summary */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                        <Shield size={20} color="#4CAF50" />
                        <h3 style={{ margin: 0, color: '#333' }}>Payment Summary</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666' }}>Plot: {selectedPlot?.title}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666' }}>Total Price:</span>
                        <span>₹{(selectedPlot?.price / 100000).toFixed(1)}L</span>
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '10px', 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: '#4CAF50',
                        padding: '10px',
                        backgroundColor: '#E8F5E8',
                        borderRadius: '8px'
                    }}>
                        <span>Token Amount:</span>
                        <span>₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
                        <span>Remaining Amount:</span>
                        <span>₹{((selectedPlot?.price - selectedPlot?.tokenAmount) / 100000).toFixed(1)}L</span>
                    </div>
                </div>

                {/* Payment Button */}
                <button
                    onClick={handleRazorpayPayment}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    <DollarSign size={20} />
                    Pay ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L Securely
                </button>

                <div style={{ 
                    textAlign: 'center', 
                    margin: '20px 0',
                    color: '#666',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    <Shield size={16} />
                    Secured by 256-bit SSL encryption
                </div>
            </div>

            {/* Simulated Razorpay Modal */}
            {showRazorpayModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '400px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#2196F3',
                            color: 'white'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>ScaleOrange Ventures</h3>
                                <p style={{ margin: '5px 0 0', fontSize: '14px', opacity: 0.9 }}>
                                    ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRazorpayModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '5px'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
                            {paymentStep === 'method' && (
                                <>
                                    {/* Payment Methods */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                            {[
                                                { id: 'card', label: 'Card', icon: CreditCard },
                                                { id: 'upi', label: 'UPI', icon: Phone },
                                                { id: 'netbanking', label: 'Net Banking', icon: Building }
                                            ].map(({ id, label, icon: Icon }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setPaymentMethod(id)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '12px 8px',
                                                        border: `2px solid ${paymentMethod === id ? '#2196F3' : '#ddd'}`,
                                                        borderRadius: '8px',
                                                        backgroundColor: paymentMethod === id ? '#E3F2FD' : 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <Icon size={18} color={paymentMethod === id ? '#2196F3' : '#666'} />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Forms */}
                                    {paymentMethod === 'card' && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                                                        Card Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="1234 5678 9012 3456"
                                                        value={cardData.cardNumber}
                                                        onChange={handleCardNumberChange}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '6px',
                                                            fontSize: '16px',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                                                            Expiry
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="MM/YY"
                                                            value={cardData.expiryDate}
                                                            onChange={handleExpiryChange}
                                                            maxLength="5"
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '6px',
                                                                fontSize: '16px',
                                                                boxSizing: 'border-box'
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                                                            CVV
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
                                                                padding: '12px',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '6px',
                                                                fontSize: '16px',
                                                                boxSizing: 'border-box'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                                                        Cardholder Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="John Doe"
                                                        value={cardData.cardholderName}
                                                        onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '6px',
                                                            fontSize: '16px',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'upi' && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                                                UPI ID
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="yourname@paytm"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    fontSize: '16px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {paymentMethod === 'netbanking' && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                                                Select Bank
                                            </label>
                                            <select style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                fontSize: '16px',
                                                boxSizing: 'border-box'
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
                                            padding: '15px',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Pay ₹{(selectedPlot?.tokenAmount / 100000).toFixed(1)}L
                                    </button>
                                </>
                            )}

                            {paymentStep === 'processing' && (
                                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <Clock size={48} color="#FF9800" style={{ marginBottom: '20px' }} />
                                    <h3 style={{ margin: '0 0 10px', color: '#333' }}>Processing Payment...</h3>
                                    <p style={{ margin: '0 0 20px', color: '#666' }}>Please wait while we process your payment</p>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${processingProgress}%`,
                                            height: '100%',
                                            backgroundColor: '#4CAF50',
                                            borderRadius: '4px',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#666' }}>
                                        {processingProgress}% Complete
                                    </p>
                                </div>
                            )}

                            {paymentStep === 'success' && (
                                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <CheckCircle size={64} color="#4CAF50" style={{ marginBottom: '20px' }} />
                                    <p style={{ margin: '0', color: '#666' }}>Your token payment has been processed</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const PaymentSuccessScreen = ({ paymentData, selectedPlot, setCurrentScreen }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [showConfetti, setShowConfetti] = useState(true);
    const [currentStep, setCurrentStep] = useState('success'); // success, scheduling, scheduled

    useEffect(() => {
        // Hide confetti after 4 seconds
        const timer = setTimeout(() => setShowConfetti(false), 4000);
        return () => clearTimeout(timer);
    }, []);

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
                        <Calendar size={24} />
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
                        <Calendar size={24} />
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
                    Loading next step...
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
