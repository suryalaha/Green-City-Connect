import React from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';

const StatCard: React.FC<{ title: string; value: string; icon: string }> = ({ title, value, icon }) => (
    <Card className="flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-2">{icon}</div>
        <p className="text-lg font-semibold text-foreground dark:text-dark-foreground">{value}</p>
        <h3 className="text-sm text-gray-500 dark:text-gray-400">{title}</h3>
    </Card>
);

const CommunityDashboardScreen: React.FC = () => {
    const { t } = useTranslations();

    const reports = [
        { id: 1, month: 'July 2024' },
        { id: 2, month: 'June 2024' },
        { id: 3, month: 'May 2024' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{t('communityDashboard')}</h1>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">{t('localityImpact')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <StatCard title={t('totalWasteCollected')} value="1,250 Kg" icon="🗑️" />
                <StatCard title={t('totalRecycled')} value="875 Kg" icon="♻️" />
                <StatCard title={t('co2Saved')} value="1,500 Kg" icon="💨" />
            </div>

            <Card>
                <h2 className="text-xl font-semibold mb-4">{t('ngoTransparency')}</h2>
                <ul className="space-y-3">
                    {reports.map(report => (
                        <li key={report.id} className="flex justify-between items-center p-3 bg-background dark:bg-dark-background rounded-lg">
                            <span>{t('reportFor')} {report.month}</span>
                            <button className="text-sm bg-primary text-white px-4 py-1 rounded-md hover:bg-primary-dark transition-colors">
                                {t('viewReport')}
                            </button>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default CommunityDashboardScreen;