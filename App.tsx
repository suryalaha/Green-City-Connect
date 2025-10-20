import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginScreen from './components/screens/LoginScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import TrackingScreen from './components/screens/TrackingScreen';
import PaymentScreen from './components/screens/PaymentScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import BottomNav from './components/BottomNav';
import Chatbot from './components/Chatbot';
import CommunityDashboardScreen from './components/screens/CommunityDashboardScreen';
import BookingScreen from './components/screens/BookingScreen';
import HelpScreen from './components/screens/HelpScreen';
import SubscriptionManagementScreen from './components/screens/SubscriptionManagementScreen';

export type Screen = 'dashboard' | 'tracking' | 'booking' | 'payment' | 'profile' | 'community' | 'help' | 'subscription';

const AppContent: React.FC = () => {
  const { user, currentScreen, setCurrentScreen } = useAppContext();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'tracking':
        return <TrackingScreen />;
      case 'booking':
        return <BookingScreen />;
      case 'payment':
        return <PaymentScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'community':
        return <CommunityDashboardScreen />;
      case 'help':
        return <HelpScreen />;
      case 'subscription':
        return <SubscriptionManagementScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex flex-col h-screen font-sans bg-background dark:bg-dark-background text-text dark:text-dark-text">
      <main className="flex-grow overflow-y-auto pb-20 p-4">
        {renderScreen()}
      </main>
      <div className="fixed bottom-24 right-4 z-50">
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="bg-primary dark:bg-dark-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark transition-colors"
          aria-label="Toggle Chatbot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
      {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
      <BottomNav />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;