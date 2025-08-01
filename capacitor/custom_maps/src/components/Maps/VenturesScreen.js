import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, ZoomControl } from 'react-leaflet';
import { MapPin, Home, FileText, DollarSign, Clock, CheckCircle, Building, Phone, Mail, User, CreditCard, Grid, Eye, ArrowLeft, IndianRupee, Info, Shield, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { App } from '@capacitor/app';
import { MapsScreen } from './MapsScreen';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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

// const FAKE_PLOTS_DATA = [
//     // Existing plots
//     {
//         id: 'SO001',
//         title: 'Premium Villa Plot - Gachibowli',
//         location: 'Gachibowli, Hyderabad',
//         area: '200 sq yards',
//         price: 8500000,
//         tokenAmount: 850000,
//         amenities: ['Gated Community', 'Club House', '24/7 Security', 'Parks'],
//         coordinates: [17.4239, 78.3776],
//         images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
//         description: 'Premium residential plot in the heart of Gachibowli tech hub',
//         nearbyProjects: ['Tech Parks', 'IT Companies']
//     },
//     {
//         id: 'SO002',
//         title: 'Luxury Apartment Plot - Kondapur',
//         location: 'Kondapur, Hyderabad',
//         area: '150 sq yards',
//         price: 6200000,
//         tokenAmount: 620000,
//         amenities: ['Swimming Pool', 'Gym', 'Garden', 'Power Backup'],
//         coordinates: [17.4647, 78.3698],
//         images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
//         description: 'Modern apartment plot with excellent connectivity',
//         nearbyProjects: ['Corporate Offices', 'Shopping Malls']
//     },
//     {
//         id: 'SO003',
//         title: 'Commercial Plot - HITEC City',
//         location: 'HITEC City, Hyderabad',
//         area: '300 sq yards',
//         price: 12000000,
//         tokenAmount: 1200000,
//         amenities: ['Prime Location', 'Metro Connectivity', 'IT Hub', 'Shopping Centers'],
//         coordinates: [17.4483, 78.3915],
//         images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
//         description: 'Prime commercial plot in the bustling HITEC City',
//         nearbyProjects: ['Microsoft', 'Google', 'Amazon Offices']
//     },
//     {
//         id: 'SO004',
//         title: 'Residential Plot - Kukatpally',
//         location: 'Kukatpally, Hyderabad',
//         area: '180 sq yards',
//         price: 4500000,
//         tokenAmount: 450000,
//         amenities: ['Schools Nearby', 'Hospital Access', 'Public Transport', 'Markets'],
//         coordinates: [17.4840, 78.4075],
//         images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
//         description: 'Family-friendly residential plot with all essential amenities',
//         nearbyProjects: ['Educational Institutions', 'Healthcare Facilities']
//     },
//     {
//         id: 'SO005',
//         title: 'Industrial Plot - Near Siddipet Projects',
//         location: 'Siddipet, Telangana',
//         area: '500 sq yards',
//         price: 15000000,
//         tokenAmount: 1500000,
//         amenities: ['Industrial Zone', 'Highway Access', 'Power Supply', 'Water Supply'],
//         coordinates: [18.1025, 78.8826], // Near Siddipet projects
//         images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
//         description: 'Prime industrial plot near Rs.670M vessels manufacturing project',
//         nearbyProjects: ['Vessels Manufacturing (Rs.670M)', 'Chemical Manufacturing']
//     },
//     {
//         id: 'SO006',
//         title: 'Investment Plot - Near Rangareddy EV Hub',
//         location: 'Rangareddy, Telangana',
//         area: '350 sq yards',
//         price: 12800000,
//         tokenAmount: 1280000,
//         amenities: ['EV Corridor', 'Tech Park Access', 'Modern Infrastructure', 'Growth Potential'],
//         coordinates: [17.1861, 78.4815], // Near Rangareddy EV project
//         images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
//         description: 'Strategic plot near Rs.1680M EV charger manufacturing project',
//         nearbyProjects: ['EV Charger Mfg (Rs.1680M)', 'RPET Chips Manufacturing']
//     },
//     {
//         id: 'SO007',
//         title: 'Commercial Plot - Uppal',
//         location: 'Uppal, Hyderabad',
//         area: '220 sq yards',
//         price: 9200000,
//         tokenAmount: 920000,
//         amenities: ['Metro Station', 'Shopping Complex', 'Restaurants', 'Banks'],
//         coordinates: [17.4065, 78.5525],
//         images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
//         description: 'Strategic commercial plot with metro connectivity',
//         nearbyProjects: ['IT Parks', 'Commercial Centers']
//     },
//     {
//         id: 'SO008',
//         title: 'Residential Plot - Kompally',
//         location: 'Kompally, Hyderabad',
//         area: '160 sq yards',
//         price: 5200000,
//         tokenAmount: 520000,
//         amenities: ['Peaceful Area', 'Schools', 'Parks', 'Community Center'],
//         coordinates: [17.5453, 78.4897],
//         images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
//         description: 'Serene residential plot in developing area',
//         nearbyProjects: ['Residential Townships', 'Educational Institutes']
//     },
//     {
//         id: 'SO009',
//         title: 'Premium Plot - Nizampet',
//         location: 'Nizampet, Hyderabad',
//         area: '300 sq yards',
//         price: 11500000,
//         tokenAmount: 1150000,
//         amenities: ['Luxury Villas', 'Club House', 'Swimming Pool', '24/7 Security'],
//         coordinates: [17.5067, 78.3908],
//         images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
//         description: 'Premium plot in upscale residential area',
//         nearbyProjects: ['Luxury Housing Projects', 'Corporate Offices']
//     },
//     {
//         id: 'SO010',
//         title: 'Investment Plot - Patancheru',
//         location: 'Patancheru, Hyderabad',
//         area: '400 sq yards',
//         price: 6800000,
//         tokenAmount: 680000,
//         amenities: ['Industrial Growth', 'Highway Access', 'Investment Potential', 'Future Development'],
//         coordinates: [17.5239, 78.2617],
//         images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
//         description: 'High-potential investment plot in industrial corridor',
//         nearbyProjects: ['Pharma Industries', 'Chemical Plants']
//     },
//     {
//         id: 'SO011',
//         title: 'Eco-Friendly Plot - Chevella',
//         location: 'Chevella, Hyderabad',
//         area: '350 sq yards',
//         price: 5500000,
//         tokenAmount: 550000,
//         amenities: ['Nature View', 'Clean Air', 'Organic Farming', 'Peaceful Environment'],
//         coordinates: [17.2786, 78.1353],
//         images: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80'],
//         description: 'Eco-friendly plot perfect for sustainable living',
//         nearbyProjects: ['Renewable Energy Projects', 'Organic Farms']
//     },
//     {
//         id: 'SO012',
//         title: 'Tech Hub Plot - Bachupally',
//         location: 'Bachupally, Hyderabad',
//         area: '280 sq yards',
//         price: 8900000,
//         tokenAmount: 890000,
//         amenities: ['IT Corridor', 'Modern Infrastructure', 'Metro Planning', 'Tech Companies'],
//         coordinates: [17.5175, 78.3478],
//         images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
//         description: 'Strategic plot in emerging tech corridor',
//         nearbyProjects: ['Tech Parks', 'Software Companies']
//     },
//     {
//         id: 'SO013',
//         title: 'Logistics Plot - Near Yadadri ICD',
//         location: 'Yadadri Bhuvanagiri, Telangana',
//         area: '450 sq yards',
//         price: 8900000,
//         tokenAmount: 890000,
//         amenities: ['Logistics Hub', 'Container Access', 'Warehousing', 'Transport Links'],
//         coordinates: [17.2758, 79.0839], // Near ICD project
//         images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
//         description: 'Perfect for logistics business near Rs.2119M ICD project',
//         nearbyProjects: ['ICD & Warehousing (Rs.2119M)', 'Logistics Infrastructure']
//     },
// ];
const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];
export const SOVenturesApp = () => {
    const [selectedSubPlots, setSelectedSubPlots] = useState([]);
    const [viewingSubPlots, setViewingSubPlots] = useState(null);
    const [currentScreen, setCurrentScreen] = useState('ventures');
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [hoveredPlot, setHoveredPlot] = useState(null);
    const [bookingData, setBookingData] = useState(null);
    const [paymentData, setPaymentData] = useState({});
    const [appointmentData, setAppointmentData] = useState({});
    const [plotStatuses, setPlotStatuses] = useState({}); // Track booked/reserved status
    const [selectedSubPlot, setSelectedSubPlot] = useState(null);
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
                            setCurrentScreen('ventures');
                            break;
                        case 'appointment':
                            setCurrentScreen('payment-success');
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
        const [paymentStep, setPaymentStep] = useState('method'); // method, processing, success
        const [processingProgress, setProcessingProgress] = useState(0);
        const [paymentData, setPaymentData] = useState(null);

        const totalPrice = selectedPlot?.totalPrice ?? selectedPlot?.price;
        const totalTokenAmount = selectedPlot?.totalTokenAmount ?? selectedPlot?.tokenAmount;

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
    
            @keyframes shimmer {
                0% {
                    background-position: -200% 0;
                }
                100% {
                    background-position: 200% 0;
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

        if (currentScreen === 'payment-success') {
            return <PaymentSuccessScreen paymentData={paymentData} selectedPlot={selectedPlot} setCurrentScreen={setCurrentScreen} />;
        }

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
                                    <span style={{ color: '#666', fontWeight: '600' }}>Plot: {selectedPlot?.title}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '12px 0',
                                    borderBottom: '1px solid rgba(76, 175, 80, 0.2)'
                                }}>
                                    <span style={{ color: '#666', fontWeight: '600' }}>💰 Total Price:</span>
                                    <span style={{ fontWeight: '700', fontSize: '16px' }}>₹{(totalPrice / 100000).toFixed(1)}L</span>
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
                                    <span style={{ color: '#2E7D32', fontWeight: '800', fontSize: '20px' }}>₹{(totalTokenAmount / 100000).toFixed(1)}L</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: '#666',
                                    fontSize: '14px',
                                    fontStyle: 'italic'
                                }}>
                                    <span>📋 Remaining Amount:</span>
                                    <span>₹{((totalPrice - totalTokenAmount) / 100000).toFixed(1)}L</span>
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
                            <span>Pay ₹{(totalTokenAmount / 100000).toFixed(1)}L Securely</span>
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
                                            ₹{(totalTokenAmount / 100000).toFixed(1)}L
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
                                                    {/* Dummy bank dropdown */}
                                                    <select
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
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Select your bank</option>
                                                        <option value="SBI">State Bank of India (SBI)</option>
                                                        <option value="ICICI">ICICI Bank</option>
                                                        <option value="HDFC">HDFC Bank</option>
                                                        <option value="AXIS">Axis Bank</option>
                                                    </select>
                                                </div>
                                            )}

                                            {/* Pay Button */}
                                            <button
                                                onClick={processPayment}
                                                style={{
                                                    width: '100%',
                                                    padding: '16px',
                                                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    fontSize: '17px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.18)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    marginTop: '8px',
                                                    animation: 'fadeInScale 0.5s ease-out',
                                                    position: 'relative'
                                                }}
                                                className="button-hover"
                                            >
                                                <Shield size={18} />
                                                <span style={{ marginLeft: '8px' }}>Pay Securely</span>
                                            </button>
                                        </>
                                    )}

                                    {paymentStep === 'processing' && (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '24px',
                                            minHeight: '200px'
                                        }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #4CAF50 60%, #8BC34A 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 0 30px rgba(76, 175, 80, 0.12)',
                                                animation: 'pulse 1.2s infinite'
                                            }}>
                                                <Shield size={38} color="white" />
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                height: '12px',
                                                borderRadius: '6px',
                                                background: '#E0E0E0',
                                                overflow: 'hidden',
                                                boxShadow: '0 0 10px rgba(76, 175, 80, 0.13)'
                                            }}>
                                                <div style={{
                                                    width: `${processingProgress}%`,
                                                    height: '100%',
                                                    borderRadius: '6px',
                                                    background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                                                    transition: 'width 0.18s',
                                                    animation: 'progressGlow 1.2s infinite'
                                                }} />
                                            </div>
                                            <div style={{ color: '#2E7D32', fontSize: '18px', fontWeight: '700', textAlign: 'center' }}>
                                                Processing Payment...
                                            </div>
                                        </div>
                                    )}

                                    {paymentStep === 'success' && (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '24px',
                                            minHeight: '200px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #4CAF50 60%, #8BC34A 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 0 30px rgba(76, 175, 80, 0.18)',
                                                animation: 'pulse 1.2s infinite'
                                            }}>
                                                <DollarSign size={38} color="white" />
                                            </div>
                                            <div style={{
                                                fontSize: '21px',
                                                fontWeight: '700',
                                                color: '#2E7D32'
                                            }}>
                                                Payment Successful! 🎉
                                            </div>
                                            <div style={{
                                                fontSize: '15px',
                                                color: '#555'
                                            }}>
                                                Your token payment has been processed successfully
                                            </div>
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

    // Payment Success Screen
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
    //     const [paymentData, setPaymentData] = useState(null);

    //     const totalPrice = selectedPlot?.totalPrice ?? selectedPlot?.price;
    //     const totalTokenAmount = selectedPlot?.totalTokenAmount ?? selectedPlot?.tokenAmount;

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
    //     // const handlePaymentSuccess = () => {
    //     //     // Update plot status to reserved
    //     //     const plotKey = selectedSubPlot?.id || selectedPlot?.id;
    //     //     setPlotStatuses(prev => ({
    //     //         ...prev,
    //     //         [plotKey]: 'reserved'  // This should be 'reserved' not 'booked'
    //     //     }));

    //     //     setPaymentData({
    //     //         method: paymentMethod,
    //     //         amount: selectedPlot.tokenAmount,
    //     //         transactionId: 'pay_' + Math.random().toString(36).substr(2, 9),
    //     //         timestamp: new Date().toISOString(),
    //     //     });
    //     //     setPaymentStep('success');
    //     //     setTimeout(() => {
    //     //         setShowRazorpayModal(false);
    //     //         setCurrentScreen('payment-success');
    //     //     }, 2000);
    //     // };


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
    //                         <span>₹{(totalPrice / 100000).toFixed(1)}L</span>
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
    //                         <span>₹{(totalTokenAmount / 100000).toFixed(1)}L</span>
    //                     </div>
    //                     <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
    //                         <span>Remaining Amount:</span>
    //                         <span>₹{((totalPrice - totalTokenAmount) / 100000).toFixed(1)}L</span>
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
    //                     Pay ₹{(totalTokenAmount / 100000).toFixed(1)}L Securely
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
    //                                     ₹{(totalTokenAmount / 100000).toFixed(1)}L
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
    //                                         Pay ₹{(totalTokenAmount / 100000).toFixed(1)}L
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

    const PaymentSuccessScreen = ({ paymentData, selectedPlot, setCurrentScreen }) => {
        const [selectedDate, setSelectedDate] = useState('');
        const [showConfetti, setShowConfetti] = useState(true);
        const [currentStep, setCurrentStep] = useState('success'); // success, scheduling, scheduled
        const totalPrice = selectedPlot?.totalPrice ?? selectedPlot?.price;
        const totalTokenAmount = selectedPlot?.totalTokenAmount ?? selectedPlot?.tokenAmount;
        const remainingAmount = totalPrice - totalTokenAmount;
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
                                ₹{(totalTokenAmount / 100000).toFixed(1)}L
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
                                        ₹{(totalTokenAmount / 100000).toFixed(1)}L
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
                                    Total: ₹{(totalPrice / 100000).toFixed(1)}L
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
                        Loading Ventures...
                    </div>
                </div>
                <button
                    onClick={() => setCurrentScreen('ventures')}
                    style={{
                        marginTop: '20px',
                        padding: '12px 30px',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Go to Ventures Now
                </button>
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
                // customerName: bookingData.fullName,
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
    //                             <div>
    //                                 Total Price: ₹{(((selectedPlot.totalPrice ?? selectedPlot.price) / 100000).toFixed(1))}L
    //                             </div>
    //                             <div>
    //                                 Token Amount: ₹{(((selectedPlot.totalTokenAmount ?? selectedPlot.tokenAmount) / 100000).toFixed(1))}L
    //                             </div>
    //                             {selectedPlot.selectedSubPlots && selectedPlot.selectedSubPlots.length > 0 && (
    //                                 <div>
    //                                     <strong>Selected Subplots:</strong> {selectedPlot.selectedSubPlots.map(sp => sp.id).join(', ')}
    //                                     <br />
    //                                     <strong>Total Area:</strong> {selectedPlot.selectedSubPlots.reduce((total, sp) => total + parseFloat(sp.measurement), 0)} sq yards
    //                                 </div>
    //                             )}
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
                                        <span style={{ color: '#E53E3E', fontWeight: '700', fontSize: '16px' }}>₹{(((selectedPlot.totalPrice ?? selectedPlot.price) / 100000).toFixed(1))}L</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '12px' }}>
                                        <span style={{ fontWeight: '700', color: '#2E7D32' }}>Token Amount:</span>
                                        <span style={{ color: '#2E7D32', fontWeight: '800', fontSize: '18px' }}>₹{(((selectedPlot.totalTokenAmount ?? selectedPlot.tokenAmount) / 100000).toFixed(1))}L</span>
                                    </div>
                                    {selectedPlot.selectedSubPlots && selectedPlot.selectedSubPlots.length > 0 && (
                                        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: '12px', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
                                            <div style={{ fontWeight: '700', color: '#1976D2', marginBottom: '8px' }}>Selected Subplots:</div>
                                            <div style={{ color: '#424242', fontSize: '14px' }}>{selectedPlot.selectedSubPlots.map(sp => sp.id).join(', ')}</div>
                                            <div style={{ color: '#424242', fontSize: '14px', marginTop: '4px' }}>
                                                <strong>Total Area:</strong> {selectedPlot.selectedSubPlots.reduce((total, sp) => total + parseFloat(sp.measurement), 0)} sq yards
                                            </div>
                                        </div>
                                    )}
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
    const VenturesScreen = () => {

        const handleSubPlotToggle = (subplot) => {
            setSelectedSubPlots(prev => {
                const isSelected = prev.some(sp => sp.id === subplot.id);
                if (isSelected) {
                    return prev.filter(sp => sp.id !== subplot.id);
                } else {
                    return [...prev, subplot];
                }
            });
        };

        const calculateSelectedPrice = (plot) => {
            if (selectedSubPlots.length === 0) return 0;
            const pricePerSqYard = plot.price / parseFloat(plot.area.split(' ')[0]);
            return selectedSubPlots.reduce((total, subplot) => {
                const sqYards = parseFloat(subplot.measurement.split(' ')[0]);
                return total + (pricePerSqYard * sqYards);
            }, 0);
        };

        const calculateSelectedTokenAmount = (plot) => {
            if (selectedSubPlots.length === 0) return 0;
            const tokenPerSqYard = plot.tokenAmount / parseFloat(plot.area.split(' ')[0]);
            return selectedSubPlots.reduce((total, subplot) => {
                const sqYards = parseFloat(subplot.measurement.split(' ')[0]);
                return total + (tokenPerSqYard * sqYards);
            }, 0);
        };

        const SubPlotGrid = ({ plot }) => (
            <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => setViewingSubPlots(null)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#FF5722',
                            fontSize: '16px',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 87, 34, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h3 style={{ margin: 0, color: '#333' }}>Select Subplots - {plot.title}</h3>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    {plot.subPlots.map((subplot) => {
                        const isSelected = selectedSubPlots.some(sp => sp.id === subplot.id);
                        return (
                            <div
                                key={subplot.id}
                                onClick={() => handleSubPlotToggle(subplot)}
                                style={{
                                    backgroundColor: isSelected ? '#E8F5E8' : '#f9f9f9',
                                    border: `2px solid ${isSelected ? '#4CAF50' : '#ddd'}`,
                                    borderRadius: '12px',
                                    padding: '15px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'center',
                                    position: 'relative'
                                }}
                            >
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        ✓
                                    </div>
                                )}
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: isSelected ? '#4CAF50' : '#333',
                                    marginBottom: '5px'
                                }}>
                                    {subplot.id}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    marginBottom: '8px'
                                }}>
                                    {subplot.measurement}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#999'
                                }}>
                                    Lat: {subplot.coordinates[0].toFixed(4)}<br />
                                    Lng: {subplot.coordinates[1].toFixed(4)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedSubPlots.length > 0 && (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        marginBottom: '20px'
                    }}>
                        <h4 style={{ margin: '0 0 15px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Info size={18} />
                            Selection Summary
                        </h4>

                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                                Selected Subplots: {selectedSubPlots.map(sp => sp.id).join(', ')}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                                Total Area: {selectedSubPlots.reduce((total, sp) => total + parseFloat(sp.measurement.split(' ')[0]), 0)} sq yards
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                    ₹{(calculateSelectedPrice(plot) / 100000).toFixed(1)}L
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Total Price</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', color: '#FF5722' }}>Token Amount</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF5722' }}>
                                    ₹{(calculateSelectedTokenAmount(plot) / 100000).toFixed(1)}L
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setSelectedPlot({
                                    ...plot,
                                    selectedSubPlots: selectedSubPlots,
                                    totalPrice: calculateSelectedPrice(plot),
                                    totalTokenAmount: calculateSelectedTokenAmount(plot)
                                });
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
                            Book Selected Subplots ({selectedSubPlots.length})
                        </button>
                    </div>
                )}

                <button
                    onClick={() => {
                        setSelectedSubPlots([]);
                        setViewingSubPlots(null);
                    }}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'transparent',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Selection & Go Back
                </button>
            </div>
        );

        if (viewingSubPlots) {
            return (
                <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto' }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#FF5722',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Grid size={24} />
                            Subplot Selection
                        </h2>
                        <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Choose individual subplots</p>
                    </div>
                    <SubPlotGrid plot={viewingSubPlots} />
                </div>
            );
        }

        return (
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
                            left: '20px',
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

                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '15px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '8px'
                                    }}>
                                        <Grid size={16} color="#FF5722" />
                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                            Available Subplots: {plot.subPlots.length}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        Individual sizes: {plot.subPlots[0].measurement} each
                                    </div>
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

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => {
                                            setViewingSubPlots(plot);
                                            setSelectedSubPlots([]);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            backgroundColor: 'transparent',
                                            color: '#FF5722',
                                            border: '2px solid #FF5722',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '5px'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#FF5722';
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.color = '#FF5722';
                                        }}
                                    >
                                        <Grid size={16} />
                                        Select Subplots
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedPlot(plot);
                                            setCurrentScreen('booking');
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            backgroundColor: '#FF5722',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#E64A19'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#FF5722'}
                                    >
                                        Book Entire Plot
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
            {currentScreen === 'mapss' && <MapView />}
            {currentScreen === 'maps' && <MapsScreen
                setCurrentScreen={setCurrentScreen}
                selectedPlot={selectedPlot}
                setSelectedPlot={setSelectedPlot}
                plotStatuses={plotStatuses}
                setPlotStatuses={setPlotStatuses}
                selectedSubPlot={selectedSubPlot}
                setSelectedSubPlot={setSelectedSubPlot}
                handleSubPlotClick={handleSubPlotClick}
            />}
            {currentScreen === 'booking' && <BookingScreen
                setCurrentScreen={setCurrentScreen}
                selectedPlot={selectedPlot}
                handleBookingSubmit={handleBookingSubmit} // Pass the handler
            />}
            {currentScreen === 'payment' && <PaymentScreen
                setCurrentScreen={setCurrentScreen}
                selectedPlot={selectedPlot}
            />}
            {currentScreen === 'payment-success' && <PaymentSuccessScreen setCurrentScreen={setCurrentScreen} selectedPlot={selectedPlot} />}
            {currentScreen === 'appointment' && <AppointmentScreen />}
            {currentScreen === 'appointment-success' && <AppointmentSuccessScreen />}
            {currentScreen === 'mybookings' && <MyBookingsScreen
                setCurrentScreen={setCurrentScreen} />}
        </div>

    );
};