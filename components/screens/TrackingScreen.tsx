import React, { useState, useEffect, useRef } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';

const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
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


const TrackingScreen: React.FC = () => {
    const { t } = useTranslations();
    const { user } = useAppContext();
    const [progress, setProgress] = useState(0); // 0 to 100
    const [eta, setEta] = useState(15);
    const [status, setStatus] = useState<'statusEnRoute' | 'statusArrivingSoon' | 'statusArrived'>('statusEnRoute');

    const truckStartPosition = { x: 10, y: 85 };
    const homePosition = { x: 90, y: 15 };

    const truckCurrentPosition = {
        x: truckStartPosition.x + (homePosition.x - truckStartPosition.x) * (progress / 100),
        y: truckStartPosition.y + (homePosition.y - truckStartPosition.y) * (progress / 100),
    };

    useEffect(() => {
        // Request geolocation permission
        navigator.geolocation.getCurrentPosition(
            () => { /* Success, do nothing special for this simulation */ },
            () => { console.warn('Geolocation permission denied.') }
        );

        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 1;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setEta(0);
                    setStatus('statusArrived');
                    return 100;
                }

                const newEta = Math.round(15 * (1 - newProgress / 100));
                setEta(newEta);
                if (newEta <= 5) {
                    setStatus('statusArrivingSoon');
                }
                return newProgress;
            });
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{t('tracking')}</h1>
            <Card>
                <h2 className="text-xl font-semibold mb-4">{t('liveTrackingTitle')}</h2>
                <div className="relative bg-gray-200 dark:bg-gray-800 h-80 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700">
                    {/* Road */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        {/* Solid road base */}
                        <line 
                            x1={`${truckStartPosition.x}%`} y1={`${truckStartPosition.y}%`} 
                            x2={`${homePosition.x}%`} y2={`${homePosition.y}%`}
                            stroke="rgb(156 163 175)"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />
                         {/* Dashed center line */}
                        <line 
                            x1={`${truckStartPosition.x}%`} y1={`${truckStartPosition.y}%`} 
                            x2={`${homePosition.x}%`} y2={`${homePosition.y}%`}
                            strokeDasharray="10, 10"
                            stroke="rgb(252 211 77)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Home Icon */}
                    <div className="absolute" style={{ left: `${homePosition.x}%`, top: `${homePosition.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className="flex flex-col items-center">
                            <HomeIcon />
                            <span className="text-xs font-semibold bg-white/70 dark:bg-black/70 px-2 py-1 rounded-full">{t('yourLocation')}</span>
                        </div>
                    </div>

                    {/* Truck Icon */}
                    <div
                        className="absolute transition-all duration-1000 linear"
                        style={{ left: `${truckCurrentPosition.x}%`, top: `${truckCurrentPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                            <TruckIcon />
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-lg">
                        <strong>{t('statusLabel')}:</strong> 
                        <span className={`font-semibold ml-2 ${status === 'statusArrived' ? 'text-green-500' : ''}`}>{t(status)}</span>
                    </p>
                    <p className="text-lg mt-2">
                        <strong>{t('etaLabel')}:</strong>
                        <span className="font-semibold ml-2">{eta} {t('minutes')}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{user?.address}</p>
                </div>
            </Card>

            <Card className="mt-6">
                <h2 className="text-xl font-semibold mb-4">{t('pickupScheduleTitle')}</h2>
                <ul className="space-y-4">
                    <li className="flex items-center">
                        <span className="text-3xl mr-4" aria-label="Recycling icon">♻️</span>
                        <div>
                            <p className="font-semibold">{t('recycling')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('pickupDayRecycling')}</p>
                        </div>
                    </li>
                    <li className="flex items-center">
                        <span className="text-3xl mr-4" aria-label="Compost icon">🌿</span>
                        <div>
                            <p className="font-semibold">{t('compost')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('pickupDayCompost')}</p>
                        </div>
                    </li>
                    <li className="flex items-center">
                        <span className="text-3xl mr-4" aria-label="General waste icon">🗑️</span>
                        <div>
                            <p className="font-semibold">{t('generalWaste')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('pickupDayGeneral')}</p>
                        </div>
                    </li>
                </ul>
            </Card>
        </div>
    );
};

export default TrackingScreen;