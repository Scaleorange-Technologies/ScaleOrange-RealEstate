import React, { useState } from 'react';
import { User, MapPin, ChevronDown, ArrowRight } from 'lucide-react';

const HomeScreen = ({ setCurrentScreen, setMapCenter, setSelectedLocation }) => {
    const [selectedLocationData, setSelectedLocationData] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Location data with coordinates for map centering and available plots/projects
    const locations = [
        {
            id: 'hyderabad',
            name: 'Hyderabad',
            state: 'Telangana',
            coordinates: [17.4550, 78.3852],
            plotsAvailable: 8,
            projectsAvailable: 15,
            areas: ['Gachibowli', 'Kondapur', 'HITEC City', 'Kukatpally', 'Uppal', 'Kompally', 'Nizampet', 'Bachupally']
        },
        {
            id: 'siddipet',
            name: 'Siddipet',
            state: 'Telangana',
            coordinates: [18.1025, 78.8826],
            plotsAvailable: 1,
            projectsAvailable: 3,
            areas: ['Industrial Zone', 'Siddipet Town']
        },
        {
            id: 'rangareddy',
            name: 'Rangareddy',
            state: 'Telangana',
            coordinates: [17.1861, 78.4815],
            plotsAvailable: 1,
            projectsAvailable: 5,
            areas: ['EV Hub Area', 'Industrial Corridor']
        },
        {
            id: 'yadadri',
            name: 'Yadadri Bhuvanagiri',
            state: 'Telangana',
            coordinates: [17.2758, 79.0839],
            plotsAvailable: 1,
            projectsAvailable: 4,
            areas: ['ICD Area', 'Logistics Hub']
        },
        {
            id: 'patancheru',
            name: 'Patancheru',
            state: 'Telangana',
            coordinates: [17.5239, 78.2617],
            plotsAvailable: 1,
            projectsAvailable: 2,
            areas: ['Industrial Corridor', 'Patancheru Town']
        },
        {
            id: 'chevella',
            name: 'Chevella',
            state: 'Telangana',
            coordinates: [17.2786, 78.1353],
            plotsAvailable: 1,
            projectsAvailable: 1,
            areas: ['Eco Zone', 'Rural Areas']
        }
    ];

    const handleLocationSelect = (location) => {
        setSelectedLocationData(location);
        setIsDropdownOpen(false);
    };

    const handleProceedToMap = () => {
        if (selectedLocationData) {
            // Pass the selected location data to the maps screen
            setMapCenter(selectedLocationData.coordinates);
            setSelectedLocation(selectedLocationData);
            setCurrentScreen('maps');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 40px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Left Side - Logo and App Name */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                }}>
                    {/* Logo */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)'
                    }}>
                        <span style={{
                            fontSize: '36px',
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            SO
                        </span>
                    </div>
                    
                    {/* App Name */}
                    <h1 style={{
                        margin: '0',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        letterSpacing: '1px'
                    }}>
                        ScaleOrange
                    </h1>
                    <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: '300'
                    }}>
                        Real Estate & Investment Platform
                    </p>
                </div>

                {/* Right Side - User Profile */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '12px 20px',
                    borderRadius: '50px',
                    backdropFilter: 'blur(10px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={20} color="white" />
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                    }}>
                        <span style={{
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            Guest User
                        </span>
                        <span style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '12px'
                        }}>
                            Welcome back!
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px'
            }}>
                {/* Welcome Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px'
                }}>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: 'white',
                        margin: '0 0 16px 0',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        Discover Prime Real Estate
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        margin: '0',
                        maxWidth: '600px',
                        lineHeight: '1.6'
                    }}>
                        Explore premium plots, investment opportunities, and active projects across Telangana
                    </p>
                </div>

                {/* Location Selection Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    maxWidth: '500px',
                    position: 'relative'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <MapPin size={24} color="#FF6B35" />
                        <h3 style={{
                            margin: '0',
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            Select Your Location
                        </h3>
                    </div>

                    {/* Dropdown */}
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                width: '100%',
                                padding: '16px 20px',
                                backgroundColor: '#f8f9fa',
                                border: '2px solid #e9ecef',
                                borderRadius: '12px',
                                fontSize: '16px',
                                color: selectedLocationData ? '#333' : '#666',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <span>
                                {selectedLocationData 
                                    ? `${selectedLocationData.name}, ${selectedLocationData.state}`
                                    : 'Choose a location to explore...'
                                }
                            </span>
                            <ChevronDown 
                                size={20} 
                                style={{
                                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease'
                                }}
                            />
                        </button>

                        {/* Dropdown Options */}
                        {isDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                right: '0',
                                backgroundColor: 'white',
                                border: '2px solid #e9ecef',
                                borderRadius: '12px',
                                marginTop: '4px',
                                zIndex: 1000,
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {locations.map((location) => (
                                    <div
                                        key={location.id}
                                        onClick={() => handleLocationSelect(location)}
                                        style={{
                                            padding: '16px 20px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f1f3f4',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    marginBottom: '4px'
                                                }}>
                                                    {location.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#666'
                                                }}>
                                                    {location.state}
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                gap: '8px',
                                                fontSize: '12px'
                                            }}>
                                                <span style={{
                                                    backgroundColor: '#e8f5e9',
                                                    color: '#2e7d32',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px'
                                                }}>
                                                    {location.plotsAvailable} plots
                                                </span>
                                                <span style={{
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#1976d2',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px'
                                                }}>
                                                    {location.projectsAvailable} projects
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Location Info */}
                    {selectedLocationData && (
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <h4 style={{
                                margin: '0 0 12px 0',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#333'
                            }}>
                                {selectedLocationData.name} Overview
                            </h4>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#4caf50'
                                    }}>
                                        {selectedLocationData.plotsAvailable}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#666'
                                    }}>
                                        Available Plots
                                    </div>
                                </div>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#2196f3'
                                    }}>
                                        {selectedLocationData.projectsAvailable}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#666'
                                    }}>
                                        Active Projects
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '8px'
                                }}>
                                    Key Areas:
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px'
                                }}>
                                    {selectedLocationData.areas.slice(0, 4).map((area, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                fontSize: '12px',
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                padding: '4px 8px',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            {area}
                                        </span>
                                    ))}
                                    {selectedLocationData.areas.length > 4 && (
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#666'
                                        }}>
                                            +{selectedLocationData.areas.length - 4} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Proceed Button */}
                    <button
                        onClick={handleProceedToMap}
                        disabled={!selectedLocationData}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            backgroundColor: selectedLocationData ? '#FF6B35' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: selectedLocationData ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            transform: selectedLocationData ? 'scale(1)' : 'scale(0.98)',
                            opacity: selectedLocationData ? 1 : 0.6
                        }}
                        onMouseOver={(e) => {
                            if (selectedLocationData) {
                                e.currentTarget.style.backgroundColor = '#e55a2b';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (selectedLocationData) {
                                e.currentTarget.style.backgroundColor = '#FF6B35';
                                e.currentTarget.style.transform = 'scale(1)';
                            }
                        }}
                    >
                        Explore Maps & Properties
                        <ArrowRight size={20} />
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginTop: '40px',
                    width: '100%',
                    maxWidth: '800px'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '24px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '8px'
                        }}>
                            13+
                        </div>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '14px'
                        }}>
                            Premium Plots Available
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '24px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '8px'
                        }}>
                            30+
                        </div>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '14px'
                        }}>
                            Active Projects
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '24px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '8px'
                        }}>
                            6
                        </div>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '14px'
                        }}>
                            Cities Covered
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;