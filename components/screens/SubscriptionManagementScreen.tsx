import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';
import { SubscriptionPlan } from '../../types';

const SubscriptionManagementScreen: React.FC = () => {
    const { user, subscriptionPlans, updateSubscription, setCurrentScreen } = useAppContext();
    const { t } = useTranslations();

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const currentPlan = useMemo(() => {
        return subscriptionPlans.find(p => p.id === user?.subscription.planId);
    }, [user, subscriptionPlans]);

    const handleSelectPlan = (plan: SubscriptionPlan) => {
        if (plan.id === currentPlan?.id) return;
        setSelectedPlan(plan);
        setError('');
    };
    
    const handleConfirmChange = async () => {
        if (!selectedPlan) return;
        
        setIsLoading(true);
        setError('');
        try {
            await updateSubscription(selectedPlan.id);
            alert(t('subscriptionUpdatedSuccess'));
            setSelectedPlan(null);
            setCurrentScreen('profile');
        } catch (err) {
            setError(t('subscriptionUpdateFailed'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const priceDifference = useMemo(() => {
        if (!selectedPlan || !currentPlan) return 0;
        return selectedPlan.pricePerMonth - currentPlan.pricePerMonth;
    }, [selectedPlan, currentPlan]);

    return (
        <div>
            {selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-sm text-center relative animate-bounce-in">
                         <button onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" disabled={isLoading}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="text-xl font-bold mb-4">{t('confirmSubscriptionChange')}</h2>
                        <p className="text-sm mb-4">{t('changePlanTo')} <span className="font-semibold">{selectedPlan.name}</span>.</p>
                        
                        <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm mb-4">
                            {priceDifference > 0 && (
                                <>
                                <p className="text-yellow-700 dark:text-yellow-300">{t('proratedCharge')}</p>
                                <div className="flex justify-between"><span>{t('chargeAmount')}:</span> <span className="font-bold">₹{priceDifference.toFixed(2)}</span></div>
                                </>
                            )}
                            <div className="flex justify-between"><span>{t('newMonthlyFee')}:</span> <span className="font-bold">₹{selectedPlan.pricePerMonth.toFixed(2)}</span></div>
                        </div>

                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <button onClick={handleConfirmChange} disabled={isLoading} className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400">
                             {isLoading ? t('processing') : priceDifference > 0 ? t('confirmAndPay') : t('confirmChange')}
                        </button>

                    </Card>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-4">{t('subscriptionManagement')}</h1>

            <Card className="mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('currentPlan')}</h2>
                {currentPlan ? (
                    <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-lg border-2 border-primary dark:border-dark-primary">
                        <h3 className="text-lg font-bold text-primary dark:text-dark-primary">{currentPlan.name}</h3>
                        <div className="mt-2 space-y-1 text-sm">
                            <p><strong>{t('binSize')}:</strong> {currentPlan.binSize}</p>
                            <p><strong>{t('collectionFrequency')}:</strong> {t(currentPlan.frequency)}</p>
                            <p><strong>{t('monthlyCost')}:</strong> ₹{currentPlan.pricePerMonth.toFixed(2)}</p>
                        </div>
                    </div>
                ) : (
                    <p>{t('noActiveSubscription')}</p>
                )}
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4">{t('availablePlans')}</h2>
                <div className="space-y-4">
                    {subscriptionPlans.map(plan => {
                        const isCurrent = plan.id === currentPlan?.id;
                        return (
                            <div key={plan.id} className={`p-4 rounded-lg border-2 ${isCurrent ? 'border-primary dark:border-dark-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div>
                                        <h3 className="font-bold">{plan.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{plan.binSize} - {t(plan.frequency)}</p>
                                        <p className="font-semibold mt-1">₹{plan.pricePerMonth.toFixed(2)} / {t('month')}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleSelectPlan(plan)}
                                        disabled={isCurrent}
                                        className="mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed bg-secondary text-white hover:opacity-90"
                                    >
                                        {isCurrent ? t('current') : t('switchToThisPlan')}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default SubscriptionManagementScreen;