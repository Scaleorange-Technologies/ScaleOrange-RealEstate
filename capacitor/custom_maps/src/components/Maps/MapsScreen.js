import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, ZoomControl } from 'react-leaflet';
import { preloadGeoJsonLinks, getGeoJsonUniversalCache, clearGeoJsonFilesystemCache, isGeoJsonCached } from '../../utils/GeoJsonCacheManager';
import { Filesystem, Encoding, Directory } from '@capacitor/filesystem';
import { MultiMapSelector, LoadingIndicator, GeoJSONUpdater, LocationMarker, checkAllLayersCacheStatus } from './MultiMapSelector';
import { App } from '@capacitor/app';
const GEOJSON_LINKS_URL = "https://raw.githubusercontent.com/Scaleorange-Technologies/ScaleOrange-RealEstate/main/capacitor/custom_maps/public/geojsonLinks.json";
const CACHE_KEY = "geojsonLinksCache";

// Plot Status Data Structure
const PLOT_STATUSES = {
    // SO001 - Premium Villa Plot - Gachibowli (Mixed availability)
    'SO001-1': 'available',
    'SO001-2': 'reserved',
    'SO001-3': 'booked',
    'SO001-4': 'available',

    // SO002 - Luxury Apartment Plot - Kondapur (Mostly taken)
    'SO002-1': 'booked',
    'SO002-2': 'booked',
    'SO002-3': 'reserved',
    'SO002-4': 'available',

    // SO003 - Commercial Plot - HITEC City (High demand - mostly unavailable)
    'SO003-1': 'booked',
    'SO003-2': 'reserved',
    'SO003-3': 'booked',
    'SO003-4': 'reserved',

    // SO004 - Residential Plot - Kukatpally (Good availability)
    'SO004-1': 'available',
    'SO004-2': 'available',
    'SO004-3': 'reserved',
    'SO004-4': 'available',

    // SO005 - Industrial Plot - Near Siddipet Projects (Mixed)
    'SO005-1': 'booked',
    'SO005-2': 'available',
    'SO005-3': 'available',
    'SO005-4': 'reserved',

    // SO006 - Investment Plot - Near Rangareddy EV Hub (High interest)
    'SO006-1': 'reserved',
    'SO006-2': 'booked',
    'SO006-3': 'available',
    'SO006-4': 'reserved',

    // SO007 - Commercial Plot - Uppal (Metro connectivity - high demand)
    'SO007-1': 'booked',
    'SO007-2': 'reserved',
    'SO007-3': 'available',
    'SO007-4': 'booked',

    // SO008 - Residential Plot - Kompally (New development - good availability)
    'SO008-1': 'available',
    'SO008-2': 'available',
    'SO008-3': 'available',
    'SO008-4': 'reserved',

    // SO009 - Premium Plot - Nizampet (Luxury segment - mixed)
    'SO009-1': 'booked',
    'SO009-2': 'available',
    'SO009-3': 'reserved',
    'SO009-4': 'available',

    // SO010 - Investment Plot - Patancheru (Industrial corridor - good potential)
    'SO010-1': 'available',
    'SO010-2': 'reserved',
    'SO010-3': 'available',
    'SO010-4': 'available',

    // SO011 - Eco-Friendly Plot - Chevella (Nature lovers - moderate interest)
    'SO011-1': 'available',
    'SO011-2': 'available',
    'SO011-3': 'reserved',
    'SO011-4': 'available',

    // SO012 - Tech Hub Plot - Bachupally (Emerging area - good availability)
    'SO012-1': 'available',
    'SO012-2': 'reserved',
    'SO012-3': 'available',
    'SO012-4': 'available',

    // SO013 - Logistics Plot - Near Yadadri ICD (Strategic location)
    'SO013-1': 'booked',
    'SO013-2': 'available',
    'SO013-3': 'reserved',
    'SO013-4': 'available'
};
export const MapsScreen = ({ setCurrentScreen, selectedPlot, setSelectedPlot, plotStatuses, setPlotStatuses, selectedSubPlot, setSelectedSubPlot, handleSubPlotClick, mapCenter, selectedLocation }) => {
    const [links, setLinks] = useState({});
    const [categories, setCategories] = useState([]);
    const [selectedMaps, setSelectedMaps] = useState({});
    const [geojsonDataMap, setGeojsonDataMap] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [downloadingStates, setDownloadingStates] = useState({});
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [currentState, setCurrentState] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [watchId, setWatchId] = useState(null);
    const [isLocationWatching, setIsLocationWatching] = useState(false);
    const [locationAccuracy, setLocationAccuracy] = useState(null);
    const [sharedLocation, setSharedLocation] = useState(null);
    const [isLocationShared, setIsLocationShared] = useState(false);
    const [shareDisabled, setShareDisabled] = useState(true);
    const [appLoading, setAppLoading] = useState(true);
    const [cachedStates, setCachedStates] = useState({});
    const [showVentures, setShowVentures] = useState(false);
    const [hoveredPlot, setHoveredPlot] = useState(null);
    const [industryOptions, setIndustryOptions] = useState([]);
    const [hoveredProject, setHoveredProject] = useState(null);

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        setProjects([]);
        const jsonPath = '/telangana_only.json';
        fetch(jsonPath)
            .then(res => res.json())
            .then(data => {
                setProjects(data);

                const uniqueIndustries = [...new Set(data.map(p => p.industry).filter(Boolean))];
                setIndustryOptions(uniqueIndustries);
            })
            .catch(err => console.error('Error loading JSON:', err));
    }, [links]); // Add links as dependency
    // Fake plots data integrated into the component
    const getInitialMapSettings = () => {
        if (mapCenter && selectedLocation) {
            // If coming from location selection, use that center
            return {
                center: mapCenter,
                zoom: selectedLocation.id === 'hyderabad' ? 11 : 12
            };
        } else if (userLocation) {
            // If user location is available, use that
            return {
                center: userLocation,
                zoom: 12
            };
        } else {
            // Default fallback
            return {
                center: [17.4550, 78.3852],
                zoom: 11
            };
        }
    };

    const mapSettings = getInitialMapSettings();

    const createProjectIcon = (project, isHovered = false) => {
        const fontSize = isHovered ? 20 : 16;

        const industryIcons = {
            'Manufacturing': '🏭',
            'Hospitality and Healthcare': '🏥',
            'Chemicals': '⚗️',
            'Infrastructure': '🏗️',
            'Research and Development': '🔬',
            'Metallurgical Industries': '⚙️',
            'Mining': '⛏️',
            'Food Processing': '🏭',
            'Petroleum': '🛢️',
            'Distillery': '🥃',
            'Power Generation': '⚡',
            'Building Materials': '🧱',
            'Automotive Industries': '🚗',
            'Environment': '🌱',
            'Textiles': '🧵',
            'Equipment': '⚙️',
            'default': '📍'
        };

        const iconSymbol = industryIcons[project.industry] || industryIcons.default;

        const iconHtml = `
            <div style="
                font-size: ${fontSize}px;
                line-height: 1;
                cursor: pointer;
                transition: transform 0.3s ease;
            ">
                ${iconSymbol}
            </div>
        `;

        return L.divIcon({
            html: iconHtml,
            className: 'emoji-only-marker',
            iconSize: [fontSize, fontSize],
            iconAnchor: [fontSize / 2, fontSize / 2],
            popupAnchor: [0, -fontSize / 2]
        });
    };

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
            description: 'Premium residential plot in the heart of Gachibowli tech hub',
            subPlots: [
                { id: 'SO001-1', measurement: '50 sq yards', coordinates: [17.4239, 78.3776] },
                { id: 'SO001-2', measurement: '50 sq yards', coordinates: [17.4240, 78.3776] },
                { id: 'SO001-3', measurement: '50 sq yards', coordinates: [17.4239, 78.3777] },
                { id: 'SO001-4', measurement: '50 sq yards', coordinates: [17.4240, 78.3777] }
            ]
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
            description: 'Modern apartment plot with excellent connectivity',
            subPlots: [
                { id: 'SO002-1', measurement: '37.5 sq yards', coordinates: [17.4647, 78.3698] },
                { id: 'SO002-2', measurement: '37.5 sq yards', coordinates: [17.4648, 78.3698] },
                { id: 'SO002-3', measurement: '37.5 sq yards', coordinates: [17.4647, 78.3699] },
                { id: 'SO002-4', measurement: '37.5 sq yards', coordinates: [17.4648, 78.3699] }
            ]
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
            description: 'Prime commercial plot in the bustling HITEC City',
            subPlots: [
                { id: 'SO003-1', measurement: '75 sq yards', coordinates: [17.4483, 78.3915] },
                { id: 'SO003-2', measurement: '75 sq yards', coordinates: [17.4484, 78.3915] },
                { id: 'SO003-3', measurement: '75 sq yards', coordinates: [17.4483, 78.3916] },
                { id: 'SO003-4', measurement: '75 sq yards', coordinates: [17.4484, 78.3916] }
            ]
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
            description: 'Family-friendly residential plot with all essential amenities',
            subPlots: [
                { id: 'SO004-1', measurement: '45 sq yards', coordinates: [17.4840, 78.4075] },
                { id: 'SO004-2', measurement: '45 sq yards', coordinates: [17.4841, 78.4075] },
                { id: 'SO004-3', measurement: '45 sq yards', coordinates: [17.4840, 78.4076] },
                { id: 'SO004-4', measurement: '45 sq yards', coordinates: [17.4841, 78.4076] }
            ]
        },
        {
            id: 'SO005',
            title: 'Industrial Plot - Near Siddipet Projects',
            location: 'Siddipet, Telangana',
            area: '500 sq yards',
            price: 15000000,
            tokenAmount: 1500000,
            amenities: ['Industrial Zone', 'Highway Access', 'Power Supply', 'Water Supply'],
            coordinates: [18.1025, 78.8826],
            images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
            description: 'Prime industrial plot near Rs.670M vessels manufacturing project',
            subPlots: [
                { id: 'SO005-1', measurement: '125 sq yards', coordinates: [18.1025, 78.8826] },
                { id: 'SO005-2', measurement: '125 sq yards', coordinates: [18.1026, 78.8826] },
                { id: 'SO005-3', measurement: '125 sq yards', coordinates: [18.1025, 78.8827] },
                { id: 'SO005-4', measurement: '125 sq yards', coordinates: [18.1026, 78.8827] }
            ]
        },
        {
            id: 'SO006',
            title: 'Investment Plot - Near Rangareddy EV Hub',
            location: 'Rangareddy, Telangana',
            area: '350 sq yards',
            price: 12800000,
            tokenAmount: 1280000,
            amenities: ['EV Corridor', 'Tech Park Access', 'Modern Infrastructure', 'Growth Potential'],
            coordinates: [17.1861, 78.4815],
            images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
            description: 'Strategic plot near Rs.1680M EV charger manufacturing project',
            subPlots: [
                { id: 'SO006-1', measurement: '87.5 sq yards', coordinates: [17.1861, 78.4815] },
                { id: 'SO006-2', measurement: '87.5 sq yards', coordinates: [17.1862, 78.4815] },
                { id: 'SO006-3', measurement: '87.5 sq yards', coordinates: [17.1861, 78.4816] },
                { id: 'SO006-4', measurement: '87.5 sq yards', coordinates: [17.1862, 78.4816] }
            ]
        },
        {
            id: 'SO007',
            title: 'Commercial Plot - Uppal',
            location: 'Uppal, Hyderabad',
            area: '220 sq yards',
            price: 9200000,
            tokenAmount: 920000,
            amenities: ['Metro Station', 'Shopping Complex', 'Restaurants', 'Banks'],
            coordinates: [17.4065, 78.5525],
            images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
            description: 'Strategic commercial plot with metro connectivity',
            subPlots: [
                { id: 'SO007-1', measurement: '55 sq yards', coordinates: [17.4065, 78.5525] },
                { id: 'SO007-2', measurement: '55 sq yards', coordinates: [17.4066, 78.5525] },
                { id: 'SO007-3', measurement: '55 sq yards', coordinates: [17.4065, 78.5526] },
                { id: 'SO007-4', measurement: '55 sq yards', coordinates: [17.4066, 78.5526] }
            ]
        },
        {
            id: 'SO008',
            title: 'Residential Plot - Kompally',
            location: 'Kompally, Hyderabad',
            area: '160 sq yards',
            price: 5200000,
            tokenAmount: 520000,
            amenities: ['Peaceful Area', 'Schools', 'Parks', 'Community Center'],
            coordinates: [17.5453, 78.4897],
            images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
            description: 'Serene residential plot in developing area',
            subPlots: [
                { id: 'SO008-1', measurement: '40 sq yards', coordinates: [17.5453, 78.4897] },
                { id: 'SO008-2', measurement: '40 sq yards', coordinates: [17.5454, 78.4897] },
                { id: 'SO008-3', measurement: '40 sq yards', coordinates: [17.5453, 78.4898] },
                { id: 'SO008-4', measurement: '40 sq yards', coordinates: [17.5454, 78.4898] }
            ]
        },
        {
            id: 'SO009',
            title: 'Premium Plot - Nizampet',
            location: 'Nizampet, Hyderabad',
            area: '300 sq yards',
            price: 11500000,
            tokenAmount: 1150000,
            amenities: ['Luxury Villas', 'Club House', 'Swimming Pool', '24/7 Security'],
            coordinates: [17.5067, 78.3908],
            images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
            description: 'Premium plot in upscale residential area',
            subPlots: [
                { id: 'SO009-1', measurement: '75 sq yards', coordinates: [17.5067, 78.3908] },
                { id: 'SO009-2', measurement: '75 sq yards', coordinates: [17.5068, 78.3908] },
                { id: 'SO009-3', measurement: '75 sq yards', coordinates: [17.5067, 78.3909] },
                { id: 'SO009-4', measurement: '75 sq yards', coordinates: [17.5068, 78.3909] }
            ]
        },
        {
            id: 'SO010',
            title: 'Investment Plot - Patancheru',
            location: 'Patancheru, Hyderabad',
            area: '400 sq yards',
            price: 6800000,
            tokenAmount: 680000,
            amenities: ['Industrial Growth', 'Highway Access', 'Investment Potential', 'Future Development'],
            coordinates: [17.5239, 78.2617],
            images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
            description: 'High-potential investment plot in industrial corridor',
            subPlots: [
                { id: 'SO010-1', measurement: '100 sq yards', coordinates: [17.5239, 78.2617] },
                { id: 'SO010-2', measurement: '100 sq yards', coordinates: [17.5240, 78.2617] },
                { id: 'SO010-3', measurement: '100 sq yards', coordinates: [17.5239, 78.2618] },
                { id: 'SO010-4', measurement: '100 sq yards', coordinates: [17.5240, 78.2618] }
            ]
        },
        {
            id: 'SO011',
            title: 'Eco-Friendly Plot - Chevella',
            location: 'Chevella, Hyderabad',
            area: '350 sq yards',
            price: 5500000,
            tokenAmount: 550000,
            amenities: ['Nature View', 'Clean Air', 'Organic Farming', 'Peaceful Environment'],
            coordinates: [17.2786, 78.1353],
            images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
            description: 'Eco-friendly plot perfect for sustainable living',
            subPlots: [
                { id: 'SO011-1', measurement: '87.5 sq yards', coordinates: [17.2786, 78.1353] },
                { id: 'SO011-2', measurement: '87.5 sq yards', coordinates: [17.2787, 78.1353] },
                { id: 'SO011-3', measurement: '87.5 sq yards', coordinates: [17.2786, 78.1354] },
                { id: 'SO011-4', measurement: '87.5 sq yards', coordinates: [17.2787, 78.1354] }
            ]
        },
        {
            id: 'SO012',
            title: 'Tech Hub Plot - Bachupally',
            location: 'Bachupally, Hyderabad',
            area: '280 sq yards',
            price: 8900000,
            tokenAmount: 890000,
            amenities: ['IT Corridor', 'Modern Infrastructure', 'Metro Planning', 'Tech Companies'],
            coordinates: [17.5175, 78.3478],
            images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
            description: 'Strategic plot in emerging tech corridor',
            subPlots: [
                { id: 'SO012-1', measurement: '70 sq yards', coordinates: [17.5175, 78.3478] },
                { id: 'SO012-2', measurement: '70 sq yards', coordinates: [17.5176, 78.3478] },
                { id: 'SO012-3', measurement: '70 sq yards', coordinates: [17.5175, 78.3479] },
                { id: 'SO012-4', measurement: '70 sq yards', coordinates: [17.5176, 78.3479] }
            ]
        },
        {
            id: 'SO013',
            title: 'Logistics Plot - Near Yadadri ICD',
            location: 'Yadadri Bhuvanagiri, Telangana',
            area: '450 sq yards',
            price: 8900000,
            tokenAmount: 890000,
            amenities: ['Logistics Hub', 'Container Access', 'Warehousing', 'Transport Links'],
            coordinates: [17.2758, 79.0839],
            images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
            description: 'Perfect for logistics business near Rs.2119M ICD project',
            subPlots: [
                { id: 'SO013-1', measurement: '112.5 sq yards', coordinates: [17.2758, 79.0839] },
                { id: 'SO013-2', measurement: '112.5 sq yards', coordinates: [17.2759, 79.0839] },
                { id: 'SO013-3', measurement: '112.5 sq yards', coordinates: [17.2758, 79.0840] },
                { id: 'SO013-4', measurement: '112.5 sq yards', coordinates: [17.2759, 79.0840] }
            ]
        }

    ];

    const mapRef = useRef(null);
    const sidebarRef = useRef(null);
    const tileLayers = {
        openstreetmap: {
            name: "OpenStreetMap",
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        cartoLight: {
            name: "CartoDB Light",
            url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
        }
    };

    const [selectedTileLayer, setSelectedTileLayer] = useState("openstreetmap");

    const getMarkerColor = (plotId, subPlotId) => {
        const status = PLOT_STATUSES[subPlotId];

        switch (status) {
            case 'available':
                return '#4CAF50'; // Green - Available
            case 'reserved':
                return '#FF9800'; // Orange - Reserved
            case 'booked':
                return '#F44336'; // Red - Booked/Unavailable
            default:
                return '#2196F3'; // Blue - Default/Unknown
        }
    };
    const getStatusInfo = (status) => {
        switch (status) {
            case 'available':
                return {
                    text: '✅ AVAILABLE',
                    bgColor: '#E8F5E8',
                    textColor: '#2E7D32',
                    buttonBg: '#4CAF50',
                    buttonText: 'Book this sub-plot',
                    disabled: false
                };
            case 'reserved':
                return {
                    text: '🔒 RESERVED',
                    bgColor: '#FFF3E0',
                    textColor: '#F57C00',
                    buttonBg: '#cccccc',
                    buttonText: 'Reserved',
                    disabled: true
                };
            case 'booked':
                return {
                    text: '❌ BOOKED',
                    bgColor: '#FFEBEE',
                    textColor: '#C62828',
                    buttonBg: '#cccccc',
                    buttonText: 'Not Available',
                    disabled: true
                };
            default:
                return {
                    text: '❓ UNKNOWN',
                    bgColor: '#E3F2FD',
                    textColor: '#1976D2',
                    buttonBg: '#2196F3',
                    buttonText: 'Check Availability',
                    disabled: false
                };
        }
    };
    // Custom icon function for plot markers
    // const createCustomIcon = (plotId, isHovered = false, color = '#FF5722') => {
    //     const size = isHovered ? 50 : 40;
    //     const iconHtml = `
    //         <div style="
    //             background: ${isHovered ? color + 'DD' : color};
    //             width: ${size}px;
    //             height: ${size * 0.8}px;
    //             border: 2px solid #FFFFFF;
    //             box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    //             display: flex;
    //             align-items: center;
    //             justify-content: center;
    //             font-weight: bold;
    //             color: #FFFFFF;
    //             font-size: ${isHovered ? '11px' : '9px'};
    //             transition: all 0.3s ease;
    //             cursor: pointer;
    //             border-radius: 4px;
    //         ">
    //             ${plotId}
    //         </div>
    //     `;

    //     return L.divIcon({
    //         html: iconHtml,
    //         className: 'custom-plot-marker',
    //         iconSize: [size, size * 0.8],
    //         iconAnchor: [size / 2, (size * 0.8) / 2],
    //         popupAnchor: [0, -(size * 0.4)]
    //     });
    // };

    const createCustomIcon = (label, isHovered, color) => {
        const size = isHovered ? 45 : 40;
        const fontSize = isHovered ? '12px' : '10px';

        return L.divIcon({
            html: `
                <div style="
                    background-color: ${color};
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 4px;
                    border: 3px solid white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: ${fontSize};
                    color: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    transition: all 0.2s ease;
                    cursor: pointer;
                    transform: rotate(0deg);
                ">
                    ${label}
                </div>
            `,
            className: 'custom-div-icon',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
    };



    // Statistics function to show availability summary
    const getAvailabilityStats = () => {
        const stats = { available: 0, reserved: 0, booked: 0 };

        Object.values(PLOT_STATUSES).forEach(status => {
            stats[status]++;
        });

        return stats;
    };

    const handleCacheStatusUpdate = useCallback((cacheStatus) => {
        setCachedStates(cacheStatus);
    }, []);

    const getMapStyle = (category, layer = null) => {
        const isRiverData = category === 'INDIAN_RIVERS' ||
            (typeof layer === 'string' && (
                layer.includes('RIVER') ||
                layer.includes('NORTH') ||
                layer.includes('SOUTH') ||
                layer.includes('EAST') ||
                layer.includes('WEST') ||
                layer.includes('CENTRAL')
            ));

        if (isRiverData) {
            return '#2196f3'; // Blue color for all river data
        }

        // Default colors for other categories
        const colors = {
            'STATES': '#4caf50',
            'INDIA': '#343434',
            'DISTRICTS': '#9c27b0',
            'RAILWAYS': '#f44336',
            'HIGHWAYS': '#607d8b',
            'POLICE': '#795548',
            'ENERGY': '#ff5722'
        };

        return colors[category] || '#666666'; // Default gray if category not found
    };


    useEffect(() => {
        preloadGeoJsonLinks();
    }, []);

    useEffect(() => {
        let isMounted = true;
        setAppLoading(true);
        setError(null);

        // Load from localStorage first for fastest display
        let localCache = null;
        if (typeof window !== "undefined" && window.localStorage) {
            try {
                localCache = window.localStorage.getItem(CACHE_KEY);
                if (localCache) {
                    const cacheObj = JSON.parse(localCache);
                    setLinks(cacheObj);
                    setCategories(Object.keys(cacheObj));
                    setAppLoading(false);
                }
            } catch { }
        }

        // Background fetch and cache update
        (async () => {
            // Check Capacitor Preferences
            let capCache = null;
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
                try {
                    const { value } = await window.Capacitor.Plugins.Preferences.get({ key: CACHE_KEY });
                    capCache = value;
                    if (capCache && capCache !== localCache && isMounted) {
                        const capObj = JSON.parse(capCache);
                        setLinks(capObj);
                        setCategories(Object.keys(capObj));
                        setAppLoading(false);
                        window.localStorage.setItem(CACHE_KEY, capCache);
                    }
                } catch { }
            }

            // Network fetch
            fetch(GEOJSON_LINKS_URL)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch geojson links");
                    return res.json();
                })
                .then(async fetchedData => {
                    if (!isMounted) return;
                    const fetchedStr = JSON.stringify(fetchedData);
                    if (fetchedStr !== localCache && fetchedStr !== capCache) {
                        setLinks(fetchedData);
                        setCategories(Object.keys(fetchedData));
                        setAppLoading(false);
                        window.localStorage.setItem(CACHE_KEY, fetchedStr);
                        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
                            await window.Capacitor.Plugins.Preferences.set({ key: CACHE_KEY, value: fetchedStr });
                        }
                    }
                })
                .catch(() => {
                    if (!localCache && !capCache && isMounted) {
                        setError("Could not fetch data and no cache found.");
                        setAppLoading(false);
                    }
                });
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        function onExternalLocation(e) {
            const { lat, lng } = e.detail;
            setUserLocation([lat, lng]);
            setLocationAccuracy(null);
            setError(null);
            setSidebarOpen(false);
            if (mapRef.current && mapRef.current.setView) {
                mapRef.current.setView([lat, lng], 16);
            }
        }
        window.addEventListener("externalLocation", onExternalLocation);
        return () => window.removeEventListener("externalLocation", onExternalLocation);
    }, []);

    // Handle clicks outside sidebar to close it
    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                !event.target.closest('.sidebar-toggle-btn')) {
                setSidebarOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Cleanup watch location on unmount
    useEffect(() => {
        return () => {
            stopWatchingLocation();
        };
    }, []);

    useEffect(() => {
        let backButtonListener = null;

        const setupBackButton = async () => {
            try {
                backButtonListener = await App.addListener('backButton', () => {
                    App.exitApp();
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
    }, []);

    // useEffect(() => {
    //     handleGetLocation();
    // }, []);


    const handleMapToggle = async (category, layer, state = null, subCategory = null, url = null) => {
        // Generate the correct map key based on the parameters
        const mapKey = subCategory
            ? `${category}-${state}-${subCategory}-${layer}`
            : state
                ? `${category}-${state}-${layer}`
                : `${category}-${layer}`;

        if (selectedMaps[mapKey]) {
            // Remove map
            setSelectedMaps(prev => {
                const newMaps = { ...prev };
                delete newMaps[mapKey];
                return newMaps;
            });
            setGeojsonDataMap(prev => {
                const newData = { ...prev };
                delete newData[mapKey];
                return newData;
            });
            setLoadingStates(prev => {
                const ns = { ...prev };
                delete ns[mapKey];
                return ns;
            });
            setDownloadingStates(prev => {
                const ns = { ...prev };
                delete ns[mapKey];
                return ns;
            });

        } else {
            // Add map
            let finalUrl = url;

            // If URL is not provided directly, try to extract it from links object
            if (!finalUrl) {
                if (subCategory) {
                    // Handle nested sub-categories (like INDIAN_RIVERS -> NORTH)
                    const categoryData = links[category];
                    if (categoryData && categoryData[layer] && categoryData[layer][subCategory]) {
                        const obj = categoryData[layer][subCategory];
                        finalUrl = obj ? Object.keys(obj)[0] : null;
                    }
                } else if (state) {
                    // Handle state-based layers
                    if (!links[category][state]) return;
                    const obj = links[category][state][layer];
                    finalUrl = obj ? Object.keys(obj)[0] : null;
                } else {
                    // Handle direct category layers
                    const obj = links[category][layer];
                    finalUrl = obj ? Object.keys(obj)[0] : null;
                }
            }

            if (!finalUrl) {
                setError(`No URL found for ${layer}`);
                return;
            }

            console.log(`🔗 Loading layer: ${layer}, URL: ${finalUrl}`);

            try {
                const isCached = await isGeoJsonCached(finalUrl);
                console.log(`📦 Cache status for ${layer}:`, isCached ? 'CACHED' : 'NOT CACHED');
                setLoadingStates(prev => {
                    const ns = { ...prev };
                    delete ns[mapKey];
                    return ns;
                });
                setDownloadingStates(prev => {
                    const ns = { ...prev };
                    delete ns[mapKey];
                    return ns;
                });
                // You can update UI here to show green dot if cached
                if (isCached) {
                    // Show green dot indicator immediately
                    setCachedStates(prev => ({ ...prev, [mapKey]: true }));
                    setLoadingStates(prev => ({ ...prev, [mapKey]: true }));
                } else {
                    // Will be downloading from network
                    setDownloadingStates(prev => ({ ...prev, [mapKey]: true }));
                }
            } catch (err) {
                console.warn('Failed to check cache status:', err);
                setDownloadingStates(prev => ({ ...prev, [mapKey]: true }));
            }

            setError(null);

            try {
                const { data, status, wasCached, cacheType } = await getGeoJsonUniversalCache(finalUrl);
                console.log("dataa:", data);
                console.log("statussss:", status);
                console.log("waschachedd:", wasCached);
                console.log("cachetypee:", cacheType);

                if (wasCached || status === 'cache') {
                    // Data was already cached - show green indicator
                    setCachedStates(prev => ({ ...prev, [mapKey]: true }));

                    console.log(`✅ ${layer} loaded from ${cacheType} cache`);
                } else {

                    setCachedStates(prev => ({ ...prev, [mapKey]: true }));
                    console.log(`🌐 ${layer} downloaded from network`);
                }

                setSelectedMaps(prev => ({ ...prev, [mapKey]: true }));

                // Create a descriptive layer name
                let layerDisplayName = layer;
                if (subCategory) {
                    layerDisplayName = `${layer} - ${subCategory}`;
                } else if (state) {
                    layerDisplayName = `${state} - ${layer}`;
                }
                setGeojsonDataMap(prev => ({
                    ...prev,
                    [mapKey]: {
                        data,
                        category,
                        layer: layerDisplayName,
                        // Add cache metadata to the stored data
                        cacheInfo: {
                            wasCached,
                            cacheType,
                            loadedAt: new Date().toISOString()
                        }
                    }
                }));

            } catch (err) {
                setError(`Failed to load ${layer}: ${err.message}`);
            } finally {
                // Remove both after short timeout so UI shows
                setTimeout(() => {
                    setLoadingStates(prev => {
                        const ns = { ...prev }; delete ns[mapKey]; return ns;
                    });
                    setDownloadingStates(prev => {
                        const ns = { ...prev }; delete ns[mapKey]; return ns;
                    });
                }, 500);
            }
        }
    };

    // Get user's current location
    const handleGetLocation = () => {
        setLocationLoading(true);
        setError(null);
        setShareDisabled(true);

        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            getCapacitorLocation();
        } else {
            getBrowserLocation();
        }
    };

    const getCapacitorLocation = async () => {
        try {
            const { Geolocation } = window.Capacitor.Plugins;
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 0
            });

            const { latitude, longitude, accuracy } = position.coords;
            setUserLocation([latitude, longitude]);
            setLocationAccuracy(accuracy);
            setLocationLoading(false);
            setShareDisabled(false);
            determineCurrentState([latitude, longitude]);
        } catch (err) {
            console.error('Capacitor Geolocation error:', err);
            setError(`Location access error-Please check your internet connection and try again`);
            setLocationLoading(false);
            getBrowserLocation();
        }
    };

    const getBrowserLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude, accuracy } = position.coords;
                setUserLocation([latitude, longitude]);
                setLocationAccuracy(accuracy);
                setLocationLoading(false);
                setShareDisabled(false);
                determineCurrentState([latitude, longitude]);
            },
            err => {
                console.error('Browser Geolocation error:', err);
                setError(`Location access error: ${err.message}`);
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };


    const watchLocationCapacitor = async () => {
        try {
            const { Geolocation } = window.Capacitor.Plugins;
            const id = await Geolocation.watchPosition(
                { enableHighAccuracy: false, timeout: 10000 },
                { timeout: 10000 },
                position => {
                    const { latitude, longitude, accuracy } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setLocationAccuracy(accuracy);
                    setShareDisabled(false);
                    determineCurrentState([latitude, longitude]);
                }
            );
            setWatchId(id);
        } catch (err) {
            console.error('Capacitor watch location error:', err);
            setError(`Watch location error: ${err.message}`);
            setIsLocationWatching(false);
            watchLocationBrowser();
        }
    };

    const watchLocationBrowser = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setIsLocationWatching(false);
            return;
        }

        const id = navigator.geolocation.watchPosition(
            position => {
                const { latitude, longitude, accuracy } = position.coords;
                setUserLocation([latitude, longitude]);
                setLocationAccuracy(accuracy);
                setShareDisabled(false);
                determineCurrentState([latitude, longitude]);
            },
            err => {
                console.error('Browser watch location error:', err);
                setError(`Watch location error: ${err.message}`);
                setIsLocationWatching(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 5000
            }
        );
        setWatchId(id);
    };

    const stopWatchingLocation = () => {
        if (watchId !== null) {
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                try {
                    const { Geolocation } = window.Capacitor.Plugins;
                    Geolocation.clearWatch({ id: watchId });
                } catch (err) {
                    console.error('Error clearing Capacitor watch:', err);
                }
            } else if (navigator.geolocation) {
                navigator.geolocation.clearWatch(watchId);
            }
            setWatchId(null);
            setIsLocationWatching(false);
        }
    };

    const shareLocation = async () => {
        if (!userLocation) return;

        setSharedLocation(userLocation);
        setIsLocationShared(true);

        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            try {
                const { Share } = window.Capacitor.Plugins;
                await Share.share({
                    title: 'Share My Location',
                    text: `Check out my location! Latitude: ${userLocation[0].toFixed(6)}, Longitude: ${userLocation[1].toFixed(6)}`,
                    url: `https://www.google.com/maps/search/?api=1&query=${userLocation[0]},${userLocation[1]}`,
                    dialogTitle: 'Share your location'
                });
            } catch (err) {
                console.error('Error sharing via Capacitor:', err);
                setError(`Failed to share location: ${err.message}`);
            }
        } else if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Share My Location',
                    text: `Check out my location! Latitude: ${userLocation[0].toFixed(6)}, Longitude: ${userLocation[1].toFixed(6)}`,
                    url: `https://www.google.com/maps/search/?api=1&query=${userLocation[0]},${userLocation[1]}`
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing via Web Share API:', err);
                    setError(`Failed to share location: ${err.message}`);
                }
            }
        } else {
            try {
                const locationText = `https://www.google.com/maps/search/?api=1&query=${userLocation[0]},${userLocation[1]}`;
                await navigator.clipboard.writeText(locationText);
                alert('Location link copied to clipboard');
            } catch (err) {
                console.error('Error copying to clipboard:', err);
                setError('Could not copy location to clipboard');
            }
        }
    };

    const determineCurrentState = async (location) => {
        try {
            const [lat, lng] = location;
            // Simple reverse geocoding logic - you might want to use a proper geocoding service
            // For now, just setting a placeholder
            setCurrentState('Location detected');
        } catch (err) {
            console.error('Error determining state:', err);
        }
    };

    const onEachFeature = (feature, layer) => {
        if (feature.properties) {
            const popupContent = Object.entries(feature.properties)
                .filter(([key]) => key !== 'shape_area' && key !== 'shape_length')
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join('<br>');

            layer.bindPopup(popupContent);
        }
    };

    const clearAllMaps = () => {
        setSelectedMaps({});
        setGeojsonDataMap({});
        setLoadingStates({});
        setDownloadingStates({});
        setError(null);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handlePlotClick = (plot) => {
        setSelectedPlot(plot);
        // You can add navigation logic here if needed
        // For example: setCurrentScreen('booking');
    };

    if (error && Object.keys(links).length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '20px'
                }}>
                    ❌
                </div>
                <h2 style={{ color: '#d32f2f', marginBottom: '10px' }}>
                    Failed to Load Map Data
                </h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    {error}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
            {/* Map Container */}
            <MapContainer
                // center={userLocation || [17.4550, 78.3852]} // Default to Hyderabad center
                // zoom={userLocation ? 12 : 11}
                center={mapSettings.center}
                zoom={mapSettings.zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                ref={mapRef}
            >
                <TileLayer
                    attribution={tileLayers[selectedTileLayer].attribution}
                    url={tileLayers[selectedTileLayer].url}
                />

                <ZoomControl position="bottomright" />

                {/* Render all selected GeoJSON layers */}
                {Object.entries(geojsonDataMap).map(([mapKey, mapInfo], index) => {
                    console.log(`Rendering map layer: ${mapKey}`, mapInfo);

                    return (
                        <GeoJSON
                            key={`${mapKey}-${mapInfo.timestamp || index}`}
                            data={mapInfo.data}
                            style={(feature) => {
                                if (feature.geometry.type === 'Point') {
                                    return {
                                        color: "#2a52be",
                                        weight: 2,
                                        opacity: 1,
                                        fillOpacity: 0.8
                                    };
                                } else {
                                    return {
                                        color: getMapStyle(mapInfo.category, index),
                                        weight: mapInfo.layer === 'INDIAN_RIVERS' ? 1 : 2,
                                        opacity: 0.8,
                                        fillOpacity: 0.3,
                                        fillColor: getMapStyle(mapInfo.category, index)
                                    };
                                }
                            }}
                            pointToLayer={(feature, latlng) => {
                                return L.circleMarker(latlng, {
                                    radius: 4,
                                    fillColor: getMapStyle(mapInfo.category, index),
                                    color: "#2a52be",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });
                            }}
                            onEachFeature={(feature, layer) => {
                                const layerName = mapInfo.layer;
                                const isRiverLayer = layerName === 'INDIAN_RIVERS';
                                const normalWeight = isRiverLayer ? 1 : 2;

                                if (feature.properties) {
                                    const popupContent = Object.entries(feature.properties)
                                        .filter(([key, value]) =>
                                            key !== 'shape_area' &&
                                            key !== 'shape_length' &&
                                            value !== null &&
                                            value !== undefined &&
                                            value !== ''
                                        )
                                        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                                        .join('<br>');

                                    if (popupContent) {
                                        layer.bindPopup(`
                                            <div style="max-width: 200px;">
                                                <strong style="color: #2a52be;">${layerName}</strong><br/>
                                                ${popupContent}
                                            </div>
                                        `);
                                    }
                                }

                                layer.on({
                                    mouseover: function (e) {
                                        this.setStyle({
                                            weight: 3,
                                            opacity: 1.0
                                        });
                                    },
                                    mouseout: function (e) {
                                        this.setStyle({
                                            weight: normalWeight,
                                            opacity: 0.8
                                        });
                                    }
                                });
                            }}
                        />
                    );
                })}


                {/* {FAKE_PLOTS_DATA.map((plot) => (
                    plot.subPlots?.map((subPlot, index) => {
                        const status = plotStatuses[subPlot.id]; 
                        const isDisabled = status === 'reserved' || status === 'booked';

                        return (
                            <Marker
                                key={subPlot.id}
                                position={[subPlot.coordinates[0], subPlot.coordinates[1]]}
                                icon={createCustomIcon(
                                    plot.id + '-' + (index + 1),
                                    hoveredPlot === subPlot.id,
                                    getMarkerColor(plot.id, subPlot.id) 
                                )}
                                eventHandlers={{
                                    mouseover: () => setHoveredPlot(subPlot.id),
                                    mouseout: () => setHoveredPlot(null),
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '220px', padding: '8px' }}>
                                        <h4 style={{ margin: '0 0 8px', color: '#333', fontSize: '15px' }}>
                                            {plot.title} - Sub Plot {index + 1}
                                        </h4>
                                        <p style={{ fontSize: '13px', color: '#666' }}>
                                            {subPlot.measurement} • {plot.location}
                                        </p>

                                        {status && (
                                            <div style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                marginBottom: '8px',
                                                backgroundColor: status === 'reserved' ? '#FFF3E0' : '#E3F2FD',
                                                color: status === 'reserved' ? '#F57C00' : '#1976D2'
                                            }}>
                                                {status === 'reserved' ? '🔒 RESERVED' : '📅 BOOKED FOR VISIT'}
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (!isDisabled) {
                                                    handleSubPlotClick(plot, subPlot);
                                                    setCurrentScreen('booking');
                                                }
                                            }}
                                            disabled={isDisabled}
                                            style={{
                                                width: '100%',
                                                padding: '6px',
                                                backgroundColor: isDisabled ? '#ccc' : '#FF5722',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: 'bold',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {isDisabled ? 'Not Available' : 'Book this sub-plot'}
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })
                ))} */}

                {FAKE_PLOTS_DATA.map((plot) => (
                    plot.subPlots?.map((subPlot, index) => {
                        const status = PLOT_STATUSES[subPlot.id];
                        const statusInfo = getStatusInfo(status);
                        const markerColor = getMarkerColor(plot.id, subPlot.id);

                        return (
                            <Marker
                                key={subPlot.id}
                                position={[subPlot.coordinates[0], subPlot.coordinates[1]]}
                                icon={createCustomIcon(
                                    plot.id.split('SO')[1] + '-' + (index + 1),
                                    hoveredPlot === subPlot.id,
                                    markerColor
                                )}
                                eventHandlers={{
                                    mouseover: () => setHoveredPlot(subPlot.id),
                                    mouseout: () => setHoveredPlot(null),
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '240px', padding: '12px' }}>
                                        <h4 style={{
                                            margin: '0 0 8px',
                                            color: '#333',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {plot.title}
                                        </h4>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            margin: '0 0 8px'
                                        }}>
                                            Sub Plot {index + 1} • {subPlot.measurement}
                                        </p>
                                        <p style={{
                                            fontSize: '13px',
                                            color: '#777',
                                            margin: '0 0 12px'
                                        }}>
                                            📍 {plot.location}
                                        </p>

                                        {/* Status Badge */}
                                        <div style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            marginBottom: '12px',
                                            backgroundColor: statusInfo.bgColor,
                                            color: statusInfo.textColor,
                                            textAlign: 'center'
                                        }}>
                                            {statusInfo.text}
                                        </div>

                                        {/* Price Information */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <p style={{
                                                fontSize: '14px',
                                                margin: '0',
                                                color: '#333',
                                                fontWeight: 'bold'
                                            }}>
                                                ₹{(plot.price / plot.subPlots.length).toLocaleString('en-IN')}
                                            </p>
                                            <p style={{
                                                fontSize: '12px',
                                                margin: '0',
                                                color: '#666'
                                            }}>
                                                Token: ₹{(plot.tokenAmount / plot.subPlots.length).toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (!statusInfo.disabled) {
                                                    handleSubPlotClick(plot, subPlot);
                                                    setCurrentScreen('booking');
                                                }
                                            }}
                                            disabled={statusInfo.disabled}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: statusInfo.buttonBg,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                cursor: statusInfo.disabled ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease',
                                                opacity: statusInfo.disabled ? 0.7 : 1
                                            }}
                                        >
                                            {statusInfo.buttonText}
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })
                ))}
                <StatusLegend />
                {projects.map((project, idx) => (
                    <Marker
                        key={`project-${project.name}-${project.latitude}-${project.longitude}-${idx}`}
                        position={[project.latitude, project.longitude]}
                        icon={createProjectIcon(project, hoveredProject === project.name)}
                        eventHandlers={{
                            mouseover: () => setHoveredProject(project.name),
                            mouseout: () => setHoveredProject(null),
                            click: () => console.log('Project clicked:', project.name)
                        }}
                    >
                        <Popup>
                            <div style={{ minWidth: '280px', padding: '10px' }}>
                                <h4 style={{
                                    margin: '0 0 10px',
                                    color: '#333',
                                    fontSize: '15px',
                                    lineHeight: '1.3'
                                }}>
                                    🏭 {project.name}
                                </h4>

                                <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: '#FF6B35' }}>Industry:</strong>
                                    <span style={{ marginLeft: '5px', color: '#666' }}>{project.industry}</span>
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: '#FF6B35' }}>Location:</strong>
                                    <span style={{ marginLeft: '5px', color: '#666' }}>{project.location}, {project.district}</span>
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: '#FF6B35' }}>Investment:</strong>
                                    <span style={{ marginLeft: '5px', color: '#666' }}>{project.investment}</span>
                                </div>

                                {project.products_and_capacity && (
                                    <div style={{ marginBottom: '8px' }}>
                                        <strong style={{ color: '#FF6B35' }}>Capacity:</strong>
                                        <span style={{ marginLeft: '5px', color: '#666', fontSize: '12px' }}>
                                            {project.products_and_capacity}
                                        </span>
                                    </div>
                                )}

                                <div style={{
                                    marginTop: '10px',
                                    padding: '8px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    color: '#666',
                                    lineHeight: '1.4'
                                }}>
                                    {project.description.substring(0, 150)}...
                                </div>

                                <div style={{
                                    marginTop: '10px',
                                    padding: '6px 12px',
                                    backgroundColor: '#e8f5e9',
                                    borderRadius: '15px',
                                    textAlign: 'center',
                                    fontSize: '11px',
                                    color: '#2e7d32',
                                    fontWeight: 'bold'
                                }}>
                                    🎯 Investment Opportunity Nearby!
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                {/* User Location Marker */}
                {userLocation && (
                    <LocationMarker position={userLocation} isShared={false} />
                )}

                {/* Shared Location Marker */}
                {sharedLocation && isLocationShared && (
                    <LocationMarker position={sharedLocation} isShared={true} />
                )}

                {/* Auto-fit bounds for GeoJSON */}
                {Object.keys(geojsonDataMap).length > 0 && (
                    <GeoJSONUpdater data={Object.values(geojsonDataMap)[0]?.data} />
                )}
            </MapContainer>
            {/* Add a back button to return to home */}

            {/* Sidebar Toggle Button */}
            <button
                className="sidebar-toggle-btn"
                onClick={toggleSidebar}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000,
                    backgroundColor: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}
            >
                {sidebarOpen ? '✕' : '☰'}
            </button>

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                style={{
                    position: 'absolute',
                    top: '0',
                    left: sidebarOpen ? '0' : '-400px',
                    width: '320px',
                    height: '100%',
                    backgroundColor: 'white',
                    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                    zIndex: 999,
                    transition: 'left 0.3s ease',
                    overflowY: 'auto',
                    padding: '80px 20px 20px 20px'
                }}
            >
                <button
                    onClick={() => setCurrentScreen('home')}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        zIndex: 1000,
                        backgroundColor: 'white',
                        color: '#FF6B35',
                        border: '2px solid #FF6B35',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}
                    title="Back to Home"
                >
                    🏠
                </button>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '14px', marginRight: '10px' }}>🗺️ Map Theme:</label>
                    <select
                        value={selectedTileLayer}
                        onChange={(e) => setSelectedTileLayer(e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '14px', borderRadius: '6px' }}
                    >
                        <option value="openstreetmap">OpenStreetMap</option>
                        <option value="cartoLight">CartoDB Light</option>
                    </select>
                </div>

                {/* Location Controls */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#444',
                        borderBottom: '2px solid #eee',
                        paddingBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📍 Location Services
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            onClick={handleGetLocation}
                            disabled={locationLoading}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: locationLoading ? '#ccc' : '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: locationLoading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {locationLoading ? '⏳' : '📍'}
                            {locationLoading ? 'Getting Location...' : 'Get My Location'}
                        </button>

                        <button
                            onClick={shareLocation}
                            disabled={shareDisabled}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: shareDisabled ? '#ccc' : '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: shareDisabled ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            📤 Share Location
                        </button>
                        <button
                            onClick={() => setCurrentScreen('mybookings')}
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                backgroundColor: "#9C27B0",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                margin: "10px 0"
                            }}
                        >
                            🗒️ My Bookings
                        </button>
                    </div>

                    {/* Location Info */}
                    {userLocation && (
                        <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}>
                            <div><strong>📍 Current Location:</strong></div>
                            <div>Lat: {userLocation[0].toFixed(6)}</div>
                            <div>Lng: {userLocation[1].toFixed(6)}</div>
                            {locationAccuracy && (
                                <div>Accuracy: {Math.round(locationAccuracy)}m</div>
                            )}
                            {currentState && (
                                <div>State: {currentState}</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Projects Section */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#444',
                        borderBottom: '2px solid #eee',
                        paddingBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        🏭 Active Projects ({projects.length})
                    </h3>

                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                        Industrial & Infrastructure Development
                    </div>

                </div>
                {/* SO Ventures Section */}
                <div style={{ marginBottom: '20px' }}>
                    <h3
                        onClick={() => setShowVentures(!showVentures)}
                        style={{
                            margin: '0 0 15px 0',
                            color: '#444',
                            borderBottom: '2px solid #eee',
                            paddingBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        🏠 SO Ventures ({FAKE_PLOTS_DATA.length}) {showVentures ? '▲' : '▼'}
                    </h3>

                    {showVentures && (
                        <>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                                Premium Real Estate Opportunities
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {FAKE_PLOTS_DATA.slice(0, 4).map((plot) => (
                                    <div
                                        key={plot.id}
                                        onClick={() => handlePlotClick(plot)}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: selectedPlot?.id === plot.id ? '#e8f5e9' : '#f8f9fa',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: selectedPlot?.id === plot.id ? '2px solid #4caf50' : '1px solid #e9ecef',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            if (selectedPlot?.id !== plot.id) {
                                                e.currentTarget.style.backgroundColor = '#e9ecef';
                                            }
                                            setHoveredPlot(plot.id);
                                        }}
                                        onMouseOut={(e) => {
                                            if (selectedPlot?.id !== plot.id) {
                                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                            }
                                            setHoveredPlot(null);
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                                            {plot.title}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                            📍 {plot.location}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#FF5722', fontWeight: 'bold' }}>
                                            ₹{(plot.price / 100000).toFixed(1)}L • {plot.area}
                                        </div>
                                    </div>
                                ))}

                                <div style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    textAlign: 'center',
                                    padding: '8px',
                                    fontStyle: 'italic'
                                }}>
                                    All {FAKE_PLOTS_DATA.length} plots are visible on the map
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Selected Plot Info */}
                {selectedPlot && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                            margin: '0 0 15px 0',
                            color: '#444',
                            borderBottom: '2px solid #eee',
                            paddingBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🔍 Selected Plot
                        </h3>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#e8f5e9',
                            borderRadius: '8px',
                            border: '2px solid #4caf50'
                        }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                                {selectedPlot.title}
                            </div>

                            {/* SHOW if it's a subplot using selectedSubPlot PROP */}
                            {selectedSubPlot && (
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                    📋 Sub-plot: {selectedSubPlot.id}
                                </div>
                            )}

                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                📍 {selectedPlot.location}
                            </div>
                            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                                <strong>Price:</strong> ₹{(selectedPlot.price / 100000).toFixed(1)}L
                            </div>
                            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                                <strong>Area:</strong> {selectedPlot.area}
                            </div>
                            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                                <strong>Token:</strong> ₹{(selectedPlot.tokenAmount / 100000).toFixed(1)}L
                            </div>

                            {/* SHOW status using plotStatuses PROP */}
                            {plotStatuses[selectedSubPlot?.id || selectedPlot?.id] && (
                                <div style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    marginBottom: '8px',
                                    backgroundColor: plotStatuses[selectedSubPlot?.id || selectedPlot?.id] === 'reserved' ? '#FFF3E0' : '#E3F2FD',
                                    color: plotStatuses[selectedSubPlot?.id || selectedPlot?.id] === 'reserved' ? '#F57C00' : '#1976D2'
                                }}>
                                    {plotStatuses[selectedSubPlot?.id || selectedPlot?.id] === 'reserved' ? '🔒 RESERVED' : '📅 BOOKED FOR VISIT'}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setSelectedPlot(null);
                                    setSelectedSubPlot(null); // USING setSelectedSubPlot PROP
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#666',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    marginTop: '8px'
                                }}
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                )}

                {/* Multi-Map Selector */}
                {Object.keys(links).length > 0 && (
                    <MultiMapSelector
                        links={links}
                        selectedMaps={selectedMaps}
                        onMapToggle={handleMapToggle}
                        downloadingStates={downloadingStates}
                        loadingStates={loadingStates}
                        cachedStates={cachedStates}
                        onCacheStatusUpdate={handleCacheStatusUpdate}
                    />
                )}

                {/* Map Controls */}
                <div style={{ marginTop: '20px' }}>
                    <button
                        onClick={clearAllMaps}
                        style={{
                            padding: '12px 16px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'center'
                        }}
                    >
                        🗑️ Clear All Maps
                    </button>
                </div>

                {/* Active Maps Info */}
                {Object.keys(selectedMaps).length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h3 style={{
                            margin: '0 0 15px 0',
                            color: '#444',
                            borderBottom: '2px solid #eee',
                            paddingBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            ✅ Active Maps ({Object.keys(selectedMaps).length})
                        </h3>

                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {Object.entries(geojsonDataMap).map(([mapKey, mapInfo]) => (
                                <div key={mapKey} style={{
                                    padding: '8px',
                                    margin: '4px 0',
                                    backgroundColor: '#e8f5e9',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: getMapStyle(mapInfo.category),
                                        display: 'inline-block'
                                    }}></span>
                                    {mapInfo.layer}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#f44336',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    zIndex: 1000,
                    maxWidth: '90%',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚠️</span>
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '16px',
                                marginLeft: '8px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>

    );
};

export const StatusLegend = () => {
    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            fontSize: '12px'
        }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 'bold' }}>
                Plot Status
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '50%',
                    marginRight: '6px'
                }}></div>
                <span>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#FF9800',
                    borderRadius: '50%',
                    marginRight: '6px'
                }}></div>
                <span>Reserved</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#F44336',
                    borderRadius: '50%',
                    marginRight: '6px'
                }}></div>
                <span>Booked</span>
            </div>
        </div>
    );
};