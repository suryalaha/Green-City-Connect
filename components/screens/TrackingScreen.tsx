import React from 'react';
import Card from '../ui/Card';

const TrackingScreen: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Tracking</h1>
            <Card>
                <h2 className="text-xl font-semibold mb-4">Live Truck Tracking</h2>
                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Map would be here</p>
                </div>
                <div className="mt-4">
                    <p><strong>Status:</strong> En Route</p>
                    <p><strong>ETA:</strong> 15 minutes</p>
                </div>
            </Card>
        </div>
    );
};

export default TrackingScreen;
