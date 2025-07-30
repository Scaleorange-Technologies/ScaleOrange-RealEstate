import React, { useEffect } from 'react';

const SplashScreen = ({ onFinish }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div style={styles.container}>
            <div style={styles.innerContainer}>
                <img
                    src="/ScaleOrange-Logo.png"
                    alt="ScaleOrange Logo"
                    style={styles.logo}
                />
                <h1 style={styles.title}>ScaleOrange Maps</h1>
                <p style={styles.tagline}>🗺️ Navigate. Explore. Invest.</p>
            </div>
        </div>
    );
};

// Keyframes as inline animation strings
const fadeIn = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const zoomSlideIn = `
    @keyframes zoomSlideIn {
        0% {
            transform: scale(0.8) translateY(20px);
            opacity: 0;
        }
        100% {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }
`;

const pulse = `
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 136, 0, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(255, 136, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 136, 0, 0); }
    }
`;

// Inject animations into the DOM (only once)
if (typeof document !== 'undefined' && !document.getElementById('splash-keyframes')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'splash-keyframes';
    styleTag.innerHTML = fadeIn + zoomSlideIn + pulse;
    document.head.appendChild(styleTag);
}

const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #fefefe, #f0f0f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 1s ease-in-out',
    },
    innerContainer: {
        textAlign: 'center',
        animation: 'zoomSlideIn 0.8s ease-out forwards',
    },
    logo: {
        width: '120px',
        height: '120px',
        borderRadius: '24px',
        marginBottom: '24px',
        animation: 'pulse 2s infinite',
    },
    title: {
        fontSize: '30px',
        fontWeight: '600',
        color: '#ff6600',
        marginBottom: '10px',
    },
    tagline: {
        fontSize: '17px',
        color: '#666',
        fontStyle: 'italic',
    },
};

export default SplashScreen;
