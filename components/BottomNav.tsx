import React from 'react';
import { Screen } from '../App';
import { useTranslations } from '../hooks/useTranslations';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';

interface NavItemProps {
  label: string;
  screen: Screen;
  icon: React.ReactElement;
  badgeCount?: number;
}

const NavItem: React.FC<NavItemProps> = ({ label, screen, icon, badgeCount }) => {
  const { currentScreen, setCurrentScreen } = useAppContext();
  const isActive = currentScreen === screen;
  return (
    <button
      onClick={() => setCurrentScreen(screen)}
      className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-300 relative group ${
        isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'
      }`}
    >
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-10 rounded-full transition-all duration-300 ease-out ${isActive ? 'bg-primary/10 scale-100' : 'scale-0 group-hover:scale-100 bg-primary/5'}`}></div>
        <div className="relative z-10">
            {icon}
            {badgeCount && badgeCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{badgeCount}</span>
            )}
        </div>
      <span className={`relative z-10 text-xs mt-1 transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC = () => {
    const { t } = useTranslations();
    const { loggedInUser, getUnreadMessageCount } = useAppContext();
    const user = loggedInUser as User;
    
    const unreadCount = user ? getUnreadMessageCount(user.id) : 0;

    const navItems: NavItemProps[] = [
        { label: t('dashboard'), screen: 'dashboard', icon: <HomeIcon /> },
        { label: t('tracking'), screen: 'tracking', icon: <TruckIcon /> },
        { label: t('booking'), screen: 'booking', icon: <CalendarIcon /> },
        { label: t('community'), screen: 'community', icon: <CommunityIcon /> },
        { label: t('payment'), screen: 'payment', icon: <CreditCardIcon /> },
        { label: t('profile'), screen: 'profile', icon: <UserIcon />, badgeCount: unreadCount },
    ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/80 dark:bg-dark-card/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 flex justify-around shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
      {navItems.map(item => (
        <NavItem key={item.screen} {...item} />
      ))}
    </nav>
  );
};

// SVG Icon Components
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" />
    </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const CommunityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const CreditCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export default BottomNav;