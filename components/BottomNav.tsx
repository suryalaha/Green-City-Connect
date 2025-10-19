import React from 'react';
import { Screen } from '../App';
import { useTranslations } from '../hooks/useTranslations';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const NavItem: React.FC<{
  label: string;
  screen: Screen;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  icon: React.ReactElement;
}> = ({ label, screen, currentScreen, onNavigate, icon }) => {
  const isActive = currentScreen === screen;
  return (
    <button
      onClick={() => onNavigate(screen)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${
        isActive ? 'text-primary dark:text-dark-primary' : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
    const { t } = useTranslations();
    const navItems = [
        { label: t('dashboard'), screen: 'dashboard' as Screen, icon: <HomeIcon /> },
        { label: t('tracking'), screen: 'tracking' as Screen, icon: <TruckIcon /> },
        { label: t('booking'), screen: 'booking' as Screen, icon: <CalendarIcon /> },
        { label: t('community'), screen: 'community' as Screen, icon: <CommunityIcon /> },
        { label: t('payment'), screen: 'payment' as Screen, icon: <CreditCardIcon /> },
        { label: t('profile'), screen: 'profile' as Screen, icon: <UserIcon /> },
    ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card dark:bg-dark-card border-t border-gray-200 dark:border-gray-700 flex justify-around shadow-lg">
      {navItems.map(item => (
        <NavItem key={item.screen} {...item} currentScreen={currentScreen} onNavigate={onNavigate} />
      ))}
    </nav>
  );
};

// SVG Icon Components
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" />
    </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const CommunityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.224-1.27-.624-1.742M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 0c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);
const CreditCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export default BottomNav;