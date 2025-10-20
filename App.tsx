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
import AdminDashboardScreen from './components/screens/AdminDashboardScreen';
import InboxScreen from './components/screens/InboxScreen';


export type Screen = 'dashboard' | 'tracking' | 'booking' | 'payment' | 'profile' | 'community' | 'help' | 'subscription' | 'inbox' | 'adminDashboard';

const AppContent: React.FC = () => {
  const { loggedInUser, currentScreen } = useAppContext();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const renderScreen = () => {
    // Admin View
    if (loggedInUser?.role === 'admin') {
      return <AdminDashboardScreen />;
    }

    // User View
    switch (currentScreen) {
      case 'dashboard': return <DashboardScreen />;
      case 'tracking': return <TrackingScreen />;
      case 'booking': return <BookingScreen />;
      case 'payment': return <PaymentScreen />;
      case 'profile': return <ProfileScreen />;
      case 'community': return <CommunityDashboardScreen />;
      case 'help': return <HelpScreen />;
      case 'subscription': return <SubscriptionManagementScreen />;
      case 'inbox': return <InboxScreen />;
      default: return <DashboardScreen />;
    }
  };

  if (!loggedInUser) {
    return <LoginScreen />;
  }
  
  // Render Admin layout without user UI elements
  if (loggedInUser.role === 'admin') {
    return (
      <div className="flex flex-col h-screen font-sans bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground">
        <main className="flex-grow overflow-y-auto p-4 md:p-6 animate-fade-in-up">
          {renderScreen()}
        </main>
      </div>
    );
  }

  // Render User layout
  return (
    <div className="flex flex-col h-screen font-sans bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground">
      <main className="flex-grow overflow-y-auto pb-24 p-4 md:p-6 animate-fade-in-up">
        {renderScreen()}
      </main>
      <div className="fixed bottom-24 right-4 z-50">
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full p-4 shadow-lg hover:from-primary-600 hover:to-secondary-600 transition-all transform hover:scale-110 active:scale-100"
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