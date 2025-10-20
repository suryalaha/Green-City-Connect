// FIX: Implement the DashboardScreen component which was missing content.
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { useTranslations } from '../../hooks/useTranslations';
import { User } from '../../types';

const DashboardScreen: React.FC = () => {
    const { loggedInUser, outstandingBalance, addWasteLog, announcements } = useAppContext();
    const user = loggedInUser as User;
    const { t } = useTranslations();
    const [lastLog, setLastLog] = useState<'wet' | 'dry' | 'mixed' | null>(null);
    const [adState, setAdState] = useState<'idle' | 'watching' | 'watched'>('idle');
    const [showSuccess, setShowSuccess] = useState(false);


    useEffect(() => {
        // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
        let timer: ReturnType<typeof setTimeout>;
        if (showSuccess) {
            timer = setTimeout(() => {
                setShowSuccess(false);
                setLastLog(null);
            }, 2000); // Hide animation after 2 seconds
        }
        return () => clearTimeout(timer);
    }, [showSuccess]);

    const handleLogWaste = (type: 'wet' | 'dry' | 'mixed') => {
        if (showSuccess) return; // Prevent re-logging while animation is showing
        const wasFinedForThirdStrike = addWasteLog(type);
        setLastLog(type);
        setShowSuccess(true);
        if (wasFinedForThirdStrike) {
            alert(t('consecutiveFineMessage'));
        }
    };

    const handleWatchAd = () => {
        setAdState('watching');
        setTimeout(() => {
            setAdState('watched');
        }, 30000); // 30 seconds
    };

    const getAdButtonText = () => {
        if (adState === 'watching') return t('watchingAd');
        if (adState === 'watched') return t('thankYou');
        return t('watchAd');
    };

    const nextPickupDate = new Date();
    nextPickupDate.setDate(nextPickupDate.getDate() + (5 - nextPickupDate.getDay() + 7) % 7); // Next Friday
    
    const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold text-foreground dark:text-dark-foreground">{t('welcome')}, {user?.name.split(' ')[0]}!</h1>
                <p className="text-lg mt-1 text-gray-500 dark:text-gray-400">{t('dashboardSubtitle')}</p>
            </div>
            
            {latestAnnouncement && (
                 <Card className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500">
                    <h2 className="text-xl font-semibold mb-2 text-amber-800 dark:text-amber-200">{latestAnnouncement.title}</h2>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{latestAnnouncement.content}</p>
                    <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">{new Date(latestAnnouncement.timestamp).toLocaleDateString()}</p>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:!scale-100 hover:!-translate-y-0">
                    <h2 className="text-xl font-semibold mb-3 text-foreground dark:text-dark-foreground">{t('nextPickup')}</h2>
                    <div className="flex items-center space-x-4">
                         <div className="text-4xl p-3 bg-secondary-100 text-secondary-600 rounded-full dark:bg-secondary-900/50 dark:text-secondary-300">🗓️</div>
                        <div>
                            <p className="font-bold text-lg text-secondary-800 dark:text-secondary-200">{nextPickupDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-sm text-gray-500">{t('generalWasteRecycling')}</p>
                        </div>
                    </div>
                </Card>
                <Card className="hover:!scale-100 hover:!-translate-y-0">
                    <h2 className="text-xl font-semibold mb-3 text-foreground dark:text-dark-foreground">{t('outstandingBalance')}</h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-4xl p-3 bg-red-100 text-red-600 rounded-full dark:bg-red-900/50 dark:text-red-300">💳</div>
                        <div>
                            <p className={`font-bold text-2xl ${outstandingBalance > 0 ? 'text-danger' : 'text-primary'}`}>
                                ₹{outstandingBalance.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">{outstandingBalance > 0 ? t('paymentDue') : t('noOutstanding')}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="hover:!scale-100 hover:!-translate-y-0">
                <h2 className="text-2xl font-semibold mb-2">{t('logYourWaste')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('wasteLogDescription')}</p>
                <div className="min-h-[160px] flex items-center justify-center">
                    {showSuccess && lastLog ? (
                        <div className="flex flex-col items-center justify-center animate-bounce-in">
                            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                                <svg className="w-16 h-16 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-center mt-4 text-lg text-green-700 dark:text-green-300 font-semibold">{t('logSuccess').replace('{type}', t(lastLog))}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                            <button onClick={() => handleLogWaste('wet')} className="flex flex-col items-center justify-center space-y-3 p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-900/70 text-green-800 dark:text-green-200 hover:shadow-lg hover:-translate-y-1 transition-all transform active:scale-95 h-40">
                                <span className="text-6xl">🍎</span>
                                <span className="font-semibold text-lg">{t('wetWaste')}</span>
                            </button>
                            <button onClick={() => handleLogWaste('dry')} className="flex flex-col items-center justify-center space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-900/70 text-blue-800 dark:text-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all transform active:scale-95 h-40">
                                <span className="text-6xl">📦</span>
                                <span className="font-semibold text-lg">{t('dryWaste')}</span>
                            </button>
                             <button onClick={() => handleLogWaste('mixed')} className="flex flex-col items-center justify-center space-y-3 p-4 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-900/70 text-amber-800 dark:text-amber-200 hover:shadow-lg hover:-translate-y-1 transition-all transform active:scale-95 h-40">
                                <span className="text-6xl">🗑️</span>
                                <span className="font-semibold text-lg">{t('mixedWaste')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </Card>

            <Card className="bg-gradient-to-r from-secondary-500 to-teal-500 text-white hover:!-translate-y-0">
                <h2 className="text-2xl font-semibold mb-2">{t('supportACause')}</h2>
                <p className="text-sm opacity-90 mb-4">{t('supportACauseDesc')}</p>
                <button
                    onClick={handleWatchAd}
                    disabled={adState !== 'idle'}
                    className="w-full bg-white/20 text-white font-semibold py-3 rounded-lg hover:bg-white/30 transition-colors disabled:bg-white/10 disabled:cursor-not-allowed"
                >
                    {getAdButtonText()}
                </button>
            </Card>
        </div>
    );
};

export default DashboardScreen;