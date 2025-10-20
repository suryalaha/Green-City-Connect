import React, { useState, useEffect, useRef } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';

// --- TYPE DEFINITIONS ---
interface Trip {
  id: number;
  startTime: number;
  endTime: number | null;
  distance: number; // in km
  route: { lat: number; lon: number }[];
  duration: number | null; // in seconds
}

interface MapBounds {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}


// --- ICONS ---
const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a2 2 0 00-2 2v1h4V4a2 2 0 00-2-2z" />
        <path fillRule="evenodd" d="M4 6a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm1 6a1 1 0 011-1h6a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
        <path d="M4 14a2 2 0 100 4 2 2 0 000-4zM16 14a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
);

const HomeIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary dark:text-dark-primary" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);

// --- HELPER FUNCTIONS ---
const haversineDistance = (coords1: { lat: number; lon: number }, coords2: { lat: number; lon: number }): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const TrackingScreen: React.FC = () => {
    const { t } = useTranslations();
    const { loggedInUser: user } = useAppContext();
    
    const [isTracking, setIsTracking] = useState(false);
    const [currentPosition, setCurrentPosition] = useState<GeolocationCoordinates | null>(null);
    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [tripHistory, setTripHistory] = useState<Trip[]>([]);

    const watchIdRef = useRef<number | null>(null);
    const previousPositionRef = useRef<GeolocationCoordinates | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    
    const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
    const mapBoundsRef = useRef<MapBounds | null>(null);

    // Load trip history from local storage on mount
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('tripHistory');
            if (storedHistory) {
                setTripHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to parse trip history from localStorage", error);
        }
    }, []);

    // Resize observer for map container
    useEffect(() => {
        const mapElement = mapContainerRef.current;
        if (!mapElement) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setMapDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });

        resizeObserver.observe(mapElement);
        return () => resizeObserver.unobserve(mapElement);
    }, []);

    // Cleanup watcher on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const mapLatLonToPixels = (lat: number, lon: number) => {
        if (!mapBoundsRef.current || !mapDimensions.width || !mapDimensions.height) {
            return { x: 0, y: 0 };
        }
        const { minLat, maxLat, minLon, maxLon } = mapBoundsRef.current;
        const latRange = maxLat - minLat;
        const lonRange = maxLon - minLon;

        // Invert Y-axis because screen coordinates start from top-left
        const x = ((lon - minLon) / lonRange) * mapDimensions.width;
        const y = ((maxLat - lat) / latRange) * mapDimensions.height;
        
        return { x, y };
    };

    const handleStartTracking = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        const newTrip: Trip = {
            id: Date.now(),
            startTime: Date.now(),
            endTime: null,
            distance: 0,
            route: [],
            duration: null,
        };
        setCurrentTrip(newTrip);
        setIsTracking(true);
        previousPositionRef.current = null;
        mapBoundsRef.current = null;
        
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setCurrentPosition(position.coords);
                
                if (!mapBoundsRef.current) {
                    const { latitude, longitude } = position.coords;
                    const padding = 0.005; // ~555 meters
                    mapBoundsRef.current = {
                        minLat: latitude - padding, maxLat: latitude + padding,
                        minLon: longitude - padding, maxLon: longitude + padding
                    };
                }

                const newPoint = { lat: position.coords.latitude, lon: position.coords.longitude };
                
                setCurrentTrip(prevTrip => {
                    if (!prevTrip) return null;
                    
                    let newDistance = prevTrip.distance;
                    if (previousPositionRef.current) {
                        newDistance += haversineDistance(
                            { lat: previousPositionRef.current.latitude, lon: previousPositionRef.current.longitude },
                            newPoint
                        );
                    }
                    previousPositionRef.current = position.coords;

                    return {
                        ...prevTrip,
                        distance: newDistance,
                        route: [...prevTrip.route, newPoint],
                    };
                });
            },
            (error) => {
                alert(`Error getting location: ${error.message}`);
                setIsTracking(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleStopTracking = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
        
        setCurrentTrip(prevTrip => {
            if (!prevTrip) return null;
            const endTime = Date.now();
            const finalTrip = {
                ...prevTrip,
                endTime,
                duration: (endTime - prevTrip.startTime) / 1000, // in seconds
            };
            
            setTripHistory(prevHistory => {
                const updatedHistory = [finalTrip, ...prevHistory];
                localStorage.setItem('tripHistory', JSON.stringify(updatedHistory));
                return updatedHistory;
            });
            return finalTrip;
        });
        setCurrentPosition(null);
    };
    
    const polylinePoints = currentTrip?.route.map(p => {
        const {x, y} = mapLatLonToPixels(p.lat, p.lon);
        return `${x},${y}`;
    }).join(' ');

    const truckPosition = currentPosition ? mapLatLonToPixels(currentPosition.latitude, currentPosition.longitude) : null;
    const homePosition = { x: mapDimensions.width * 0.9, y: mapDimensions.height * 0.15 };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{t('tracking')}</h1>
            
             <Card className="mb-6">
                <button
                    onClick={isTracking ? handleStopTracking : handleStartTracking}
                    className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition-colors ${
                        isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'
                    }`}
                >
                    {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </button>
            </Card>

            {isTracking && currentPosition && (
                 <Card className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Live Stats</h2>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm text-gray-500">Speed</p>
                            <p className="text-2xl font-bold">
                                {currentPosition.speed ? (currentPosition.speed * 3.6).toFixed(1) : '0.0'}
                                <span className="text-base font-normal ml-1">km/h</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Distance</p>
                            <p className="text-2xl font-bold">
                                {currentTrip?.distance.toFixed(2) || '0.00'}
                                <span className="text-base font-normal ml-1">km</span>
                            </p>
                        </div>
                         <div className="col-span-2">
                            <p className="text-sm text-gray-500">Current Location (Lat, Lon)</p>
                            <p className="text-lg font-mono">
                                {currentPosition.latitude.toFixed(5)}, {currentPosition.longitude.toFixed(5)}
                            </p>
                        </div>
                    </div>
                 </Card>
            )}

            <Card>
                <h2 className="text-xl font-semibold mb-4">{t('liveTrackingTitle')}</h2>
                <div 
                    ref={mapContainerRef}
                    className="relative bg-gray-200 dark:bg-gray-800 h-80 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700"
                >
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        {polylinePoints && (
                           <polyline
                                points={polylinePoints}
                                fill="none"
                                stroke="rgb(59 130 246)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </svg>

                    <div className="absolute" style={{ left: `${homePosition.x}px`, top: `${homePosition.y}px`, transform: 'translate(-50%, -50%)' }}>
                        <div className="flex flex-col items-center">
                            <HomeIcon />
                            <span className="text-xs font-semibold bg-white/70 dark:bg-black/70 px-2 py-1 rounded-full">{t('yourLocation')}</span>
                        </div>
                    </div>

                    {truckPosition && (
                        <div
                            className="absolute transition-all duration-500"
                            style={{ left: `${truckPosition.x}px`, top: `${truckPosition.y}px`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                                <TruckIcon />
                            </div>
                        </div>
                    )}
                </div>
                 <div className="mt-6 text-center">
                    <p className="text-lg">
                        <strong>{t('statusLabel')}:</strong> 
                        <span className={`font-semibold ml-2 ${isTracking ? 'text-green-500' : 'text-gray-500'}`}>{isTracking ? 'Tracking Active' : 'Idle'}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{user?.role === 'user' && user.address}</p>
                </div>
            </Card>

            <Card className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Trip History</h2>
                {tripHistory.length > 0 ? (
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                       {tripHistory.map(trip => (
                           <li key={trip.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                               <div className="flex justify-between items-center">
                                   <div>
                                        <p className="font-semibold">
                                           Trip on {new Date(trip.startTime).toLocaleDateString()}
                                       </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(trip.startTime).toLocaleTimeString()}
                                       </p>
                                   </div>
                                    <div className="text-right">
                                       <p className="font-semibold">{trip.distance.toFixed(2)} km</p>
                                       <p className="text-sm text-gray-500 dark:text-gray-400">
                                           {trip.duration ? `${Math.floor(trip.duration / 60)}m ${Math.round(trip.duration % 60)}s` : '-'}
                                        </p>
                                   </div>
                               </div>
                           </li>
                       ))}
                    </ul>
                ) : (
                    <p className="text-sm text-center text-gray-500 py-4">No trip history found.</p>
                )}
            </Card>
        </div>
    );
};

export default TrackingScreen;