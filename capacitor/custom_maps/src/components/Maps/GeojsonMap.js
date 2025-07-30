import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, ZoomControl } from 'react-leaflet';
import { Calendar, MapPin, Home, FileText, DollarSign, Clock, CheckCircle, Building, Phone, Mail, User, CreditCard, Grid, Eye, ArrowLeft, IndianRupee } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { App } from '@capacitor/app';
import { preloadGeoJsonLinks, getGeoJsonUniversalCache, clearGeoJsonFilesystemCache, isGeoJsonCached } from '../../utils/GeoJsonCacheManager';
import { Filesystem, Encoding, Directory } from '@capacitor/filesystem';
import { MultiMapSelector, LoadingIndicator, GeoJSONUpdater, LocationMarker, checkAllLayersCacheStatus } from './MultiMapSelector';
import { ProjectsScreen } from './ProjectsScreen';
import { initBookingDB, saveBooking } from '../../services/sqliteBookingService';
import { SOVenturesApp } from './VenturesScreen';
const GEOJSON_LINKS_URL = "https://raw.githubusercontent.com/Scaleorange-Technologies/MAPS_VERSION2/main/capacitor/custom_maps/public/geojsonLinks.json";
const CACHE_KEY = "geojsonLinksCache";

if (typeof window !== "undefined" && !window._externalLocationHandlerSet) {
    window._externalLocationHandlerSet = true;
    window.handleExternalLocation = (lat, lng) => {
        window.dispatchEvent(new CustomEvent("externalLocation", { detail: { lat, lng } }));
    };
}


// Main App Component
export default function SOMultiScreenApp() {
    const [currentScreen, setCurrentScreen] = useState('maps');
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [bookingData, setBookingData] = useState({});


    const MapsScreen = () => {
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
        const [currentZoom, setCurrentZoom] = useState(5);
        const [loadedChunks, setLoadedChunks] = useState(new Set());
        const [riverChunksData, setRiverChunksData] = useState({});
        const [cachedStates, setCachedStates] = useState({});
        const [showVentures, setShowVentures] = useState(false);
        const [showProjects, setShowProjects] = useState(false);

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

        const ZOOM_CHUNK_CONFIG = {
            5: { maxChunks: 2, chunkIds: [1, 2] },          // Country level - major rivers only
            7: { maxChunks: 5, chunkIds: [1, 2, 3, 4, 5] }, // State level - more rivers
            9: { maxChunks: 10, chunkIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, // District level
            11: { maxChunks: 15, chunkIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // City level
            13: { maxChunks: 25, chunkIds: Array.from({ length: 25 }, (_, i) => i + 1) } // All chunks
        };
        const downloadAndChunkRivers = async () => {
            console.log("⬇️ Downloading fresh river data...");
            setDownloadingStates(prev => ({ ...prev, "INDIAN_RIVERS": true }));

            try {
                const linksResponse = await fetch("https://raw.githubusercontent.com/Scaleorange-Technologies/MAPS_VERSION2/main/capacitor/custom_maps/public/geojson_indian_rivers_links.json");
                const linksJson = await linksResponse.json();
                const urls = linksJson["indian_rivers"];

                const allFeatures = [];
                for (const link of urls) {
                    try {
                        const res = await fetch(link);
                        const json = await res.json();

                        if (json.type === "FeatureCollection" && Array.isArray(json.features)) {
                            allFeatures.push(...json.features);
                        }
                    } catch (fetchErr) {
                        console.error(`⚠️ Failed to fetch ${link}:`, fetchErr);
                    }
                }

                // Sort features by importance (you might want to sort by river size/importance)
                // For now, we'll assume the data is already sorted by importance

                // Save chunks
                const chunkSize = 5000; // Keep your current chunk size
                const totalChunks = Math.ceil(allFeatures.length / chunkSize);

                for (let i = 0; i < totalChunks; i++) {
                    const chunk = {
                        type: "FeatureCollection",
                        features: allFeatures.slice(i * chunkSize, (i + 1) * chunkSize)
                    };

                    await Filesystem.writeFile({
                        path: `geojson_indian_rivers_chunk_${i + 1}.json`,
                        data: JSON.stringify(chunk),
                        directory: Directory.Data,
                        encoding: Encoding.UTF8
                    });

                    console.log(`📁 Saved chunk ${i + 1}/${totalChunks}`);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // Save meta info
                await Filesystem.writeFile({
                    path: "geojson_indian_rivers_meta.json",
                    data: JSON.stringify({ totalChunks }),
                    directory: Directory.Data,
                    encoding: Encoding.UTF8
                });

                console.log(`✅ Successfully chunked ${allFeatures.length} river features into ${totalChunks} chunks`);

                // Start progressive loading
                loadRiversProgressively(currentZoom);

            } catch (err) {
                console.error("❌ Error downloading and chunking rivers:", err);
                setError(`Failed to download rivers: ${err.message}`);
            } finally {
                setDownloadingStates(prev => {
                    const ns = { ...prev };
                    delete ns["INDIAN_RIVERS"];
                    return ns;
                });
            }
        };
        const loadRiversProgressively = async (zoom) => {
            const mapKey = "INDIAN_RIVERS";
            setError(null);

            try {
                console.log(`🔍 Loading rivers for zoom level: ${zoom}`);

                // Get required chunks for this zoom level
                const zoomConfig = Object.keys(ZOOM_CHUNK_CONFIG)
                    .sort((a, b) => b - a) // Sort descending
                    .find(z => zoom >= parseInt(z));

                const config = ZOOM_CHUNK_CONFIG[zoomConfig || 5];
                console.log(`📋 Zoom config:`, config);

                // Check which chunks we already have
                const neededChunks = config.chunkIds.filter(id => !loadedChunks.has(id));
                console.log(`📦 Need to load chunks:`, neededChunks);

                if (neededChunks.length === 0) {
                    // All required chunks already loaded, just filter and render
                    updateRiverDisplay(config.chunkIds);
                    return;
                }

                setLoadingStates(prev => ({ ...prev, [mapKey]: true }));

                // Check if meta file exists
                let meta;
                try {
                    const metaFile = await Filesystem.readFile({
                        path: "geojson_indian_rivers_meta.json",
                        directory: Directory.Data,
                        encoding: Encoding.UTF8
                    });
                    meta = JSON.parse(metaFile.data);
                } catch (statErr) {
                    console.log("📂 No meta file, will download fresh data");
                    // If no meta file, fall back to downloading fresh data
                    await downloadAndChunkRivers();
                    return;
                }

                // Load only the needed chunks
                const newChunkData = { ...riverChunksData };

                for (const chunkId of neededChunks) {
                    try {
                        const chunkFile = await Filesystem.readFile({
                            path: `geojson_indian_rivers_chunk_${chunkId}.json`,
                            directory: Directory.Data,
                            encoding: Encoding.UTF8
                        });
                        const chunk = JSON.parse(chunkFile.data);

                        if (chunk?.features?.length > 0) {
                            newChunkData[chunkId] = chunk;
                            setLoadedChunks(prev => new Set([...prev, chunkId]));
                            console.log(`✅ Loaded chunk ${chunkId} with ${chunk.features.length} features`);
                        }

                        // Small delay to prevent UI blocking
                        await new Promise(resolve => setTimeout(resolve, 10));

                    } catch (chunkError) {
                        console.error(`❌ Error loading chunk ${chunkId}:`, chunkError);
                    }
                }

                setRiverChunksData(newChunkData);
                updateRiverDisplay(config.chunkIds);

            } catch (err) {
                console.error("❌ Error in progressive loading:", err);
                setError(`Failed to load rivers: ${err.message}`);
            } finally {
                setLoadingStates(prev => {
                    const ns = { ...prev };
                    delete ns[mapKey];
                    return ns;
                });
            }
        };

        // Function to combine and display selected chunks
        const updateRiverDisplay = (chunkIds) => {
            const mapKey = "INDIAN_RIVERS";

            // Combine features from selected chunks
            const combinedFeatures = [];
            chunkIds.forEach(chunkId => {
                const chunk = riverChunksData[chunkId];
                if (chunk?.features) {
                    combinedFeatures.push(...chunk.features);
                }
            });

            const combinedData = {
                type: "FeatureCollection",
                features: combinedFeatures
            };

            console.log(`🌊 Displaying ${combinedFeatures.length} river features from ${chunkIds.length} chunks`);

            // Update the display
            setSelectedMaps(prev => ({ ...prev, [mapKey]: true }));
            setGeojsonDataMap(prev => ({
                ...prev,
                [mapKey]: {
                    data: combinedData,
                    category: "RIVERS",
                    layer: "INDIAN_RIVERS",
                    timestamp: Date.now(),
                    chunksLoaded: chunkIds.length
                }
            }));
        };

        // Add zoom change handler to your MapContainer
        const handleZoomChange = (zoom) => {
            setCurrentZoom(zoom);

            // Only reload if rivers are currently selected
            const mapKey = "INDIAN_RIVERS";
            if (selectedMaps[mapKey]) {
                loadRiversProgressively(zoom);
            }
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

        useEffect(() => {
            handleGetLocation();
        }, []);

        const getMapKey = (category, state, layer) => {
            return state ? `${category}-${state}-${layer}` : `${category}-${layer}`;
        };

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

        const startWatchingLocation = () => {
            setError(null);
            setIsLocationWatching(true);

            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                watchLocationCapacitor();
            } else {
                watchLocationBrowser();
            }
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
                    center={userLocation || [20.5937, 78.9629]}
                    zoom={userLocation ? 12 : 5}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    ref={mapRef}
                    onZoomEnd={(e) => handleZoomChange(e.target.getZoom())} // Add this line
                >
                    {/* <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                /> */}
                    <TileLayer
                        attribution={tileLayers[selectedTileLayer].attribution}
                        url={tileLayers[selectedTileLayer].url}
                    />


                    <ZoomControl position="bottomright" />

                    {/* Render all selected GeoJSON layers */}
                    {Object.entries(geojsonDataMap).map(([mapKey, mapInfo], index) => {
                        console.log(`Rendering map layer: ${mapKey}`, mapInfo); // Debug log

                        return (
                            <GeoJSON
                                key={`${mapKey}-${mapInfo.timestamp || index}`} // Use timestamp to force re-render
                                data={mapInfo.data}
                                style={(feature) => {
                                    // Different styles for different geometry types
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
                                            weight: mapInfo.layer === 'INDIAN_RIVERS' ? 1 : 2, // Thinner lines for rivers
                                            opacity: 0.8,
                                            fillOpacity: 0.3,
                                            fillColor: getMapStyle(mapInfo.category, index)
                                        };
                                    }
                                }}
                                pointToLayer={(feature, latlng) => {
                                    return L.circleMarker(latlng, {
                                        radius: 4, // Smaller radius for rivers
                                        fillColor: getMapStyle(mapInfo.category, index),
                                        color: "#2a52be",
                                        weight: 1,
                                        opacity: 1,
                                        fillOpacity: 0.8
                                    });
                                }}
                                onEachFeature={(feature, layer) => {
                                    // Capture mapInfo values for use in event handlers
                                    const layerName = mapInfo.layer;
                                    const isRiverLayer = layerName === 'INDIAN_RIVERS';
                                    const normalWeight = isRiverLayer ? 1 : 2;

                                    // Enhanced popup for rivers
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

                                    // Add hover effects
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
                            🏠 SO Ventures {showVentures ? '▲' : '▼'}
                        </h3>

                        {showVentures && (
                            <>
                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                                    Premium Real Estate Opportunities
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {FAKE_PLOTS_DATA.slice(0, 2).map((plot) => (
                                        <div
                                            key={plot.id}
                                            onClick={() => {
                                                setSelectedPlot(plot);
                                                setCurrentScreen('booking');
                                                setSidebarOpen(false);
                                            }}
                                            style={{
                                                padding: '12px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: '1px solid #e9ecef',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
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

                                    <button
                                        onClick={() => {
                                            setCurrentScreen('ventures');
                                            setSidebarOpen(false);
                                        }}
                                        style={{
                                            padding: '10px 16px',
                                            backgroundColor: '#FF5722',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        View All Plots →
                                    </button>
                                </div>
                            </>
                        )}
                    </div>


                    {/* Projects Section */}

                    <div style={{ marginBottom: '20px' }}>
                        <h3
                            onClick={() => setShowProjects(!showProjects)}
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
                            🏢 New Projects {showProjects ? '▲' : '▼'}
                        </h3>

                        {showProjects && (
                            <>
                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                                    Upcoming Development Projects
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { title: 'SO Tech Park Phase 2', location: 'Gachibowli', status: 'Planning', completion: '2026' },
                                        { title: 'SO Residential Complex', location: 'Kondapur', status: 'In Progress', completion: '2025' }
                                    ].map((project, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '12px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '8px',
                                                border: '1px solid #e9ecef'
                                            }}
                                        >
                                            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                                                {project.title}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                                                📍 {project.location}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{
                                                    backgroundColor: project.status === 'In Progress' ? '#4CAF50' : '#FF9800',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '8px',
                                                    fontSize: '10px'
                                                }}>
                                                    {project.status}
                                                </span>
                                                <span style={{ color: '#666', fontSize: '11px' }}>Est. {project.completion}</span>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => {
                                            setCurrentScreen('projects');
                                            setSidebarOpen(false);
                                        }}
                                        style={{
                                            padding: '10px 16px',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        View All Projects →
                                    </button>
                                </div>
                            </>
                        )}
                    </div>


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
    }

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


    // Main render logic
    const renderCurrentScreen = () => {
        switch (currentScreen) {
            case 'maps': return <MapsScreen />;
            case 'projects': return <ProjectsScreen />;
            case 'ventures': return <SOVenturesApp />;
            case 'booking': return <BookingScreen />;
            case 'payment': return <PaymentScreen />;
            case 'payment-success': return <PaymentSuccessScreen />;
            case 'appointment': return <AppointmentScreen />;
            case 'appointment-success': return <AppointmentSuccessScreen />;
            default: return <SOVenturesApp />;
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {renderCurrentScreen()}
        </div>
    );
}