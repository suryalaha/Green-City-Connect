// FIX: Implement the missing AppContext and AppProvider.
// NOTE: This file contains JSX and should ideally have a .tsx extension,
// but is named .ts to match the provided file structure and error messages.

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, WasteLog, Booking, Pickup, Complaint, Payment } from '../types';
import { translations } from '../utils/translations';

type Language = 'en'; // Can be extended with more languages
type Theme = 'light' | 'dark';

interface AppContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  outstandingBalance: number;
  addWasteLog: (type: 'wet' | 'dry' | 'mixed') => boolean;
  wasteLogs: WasteLog[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  bookings: Booking[];
  pickupHistory: Pickup[];
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'date' | 'status'>) => void;
  theme: Theme;
  toggleTheme: () => void;
  payments: Payment[];
  makePayment: (amount: number) => Promise<Payment>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [outstandingBalance, setOutstandingBalance] = useState(75.00);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pickupHistory, setPickupHistory] = useState<Pickup[]>([
    { type: 'recycling', date: new Date(Date.now() - 86400000 * 60).toISOString() },
    { type: 'compost', date: new Date(Date.now() - 86400000 * 30).toISOString() },
  ]);
   const [complaints, setComplaints] = useState<Complaint[]>([
        {
            id: 'c1',
            date: new Date(Date.now() - 86400000 * 5).toISOString(),
            issueType: 'missed-pickup',
            description: 'The truck did not come down our street today.',
            status: 'resolved',
        },
        {
            id: 'c2',
            date: new Date(Date.now() - 86400000).toISOString(),
            issueType: 'service-issue',
            description: 'The bins were left in the middle of the driveway.',
            status: 'in-progress',
        }
    ]);
  const [payments, setPayments] = useState<Payment[]>([
    { id: 'TXN1003', date: '2024-07-01', amount: 75.00, status: 'paid' },
    { id: 'TXN1002', date: '2024-06-01', amount: 75.00, status: 'paid' },
    { id: 'TXN1001', date: '2024-05-01', amount: 75.00, status: 'paid' },
  ]);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const t = useCallback((key: string): string => {
    const translationSet = translations[language] as Record<string, string>;
    return translationSet[key] || key;
  }, [language]);

  const addWasteLog = (type: 'wet' | 'dry' | 'mixed'): boolean => {
      const newLog: WasteLog = { type, timestamp: Date.now(), fined: false };
      
      const recentLogs = [...wasteLogs].slice(-2);
      const isThirdStrike = recentLogs.length === 2 && recentLogs.every(log => log.type === 'mixed') && type === 'mixed';

      if (isThirdStrike) {
          newLog.fined = true;
          setOutstandingBalance(prev => prev + 100);
      }
      setWasteLogs(prev => [...prev, newLog]);

      const pickupType = type === 'wet' ? 'compost' : type === 'dry' ? 'recycling' : 'general';
      const newPickup: Pickup = { type: pickupType, date: new Date().toISOString() };
      setPickupHistory(prev => [...prev, newPickup]);

      return isThirdStrike;
  };

  const addBooking = (bookingData: Omit<Booking, 'id'>) => {
      const newBooking: Booking = {
          ...bookingData,
          id: Date.now().toString(),
      };
      setBookings(prev => [...prev, newBooking]);
  };

  const addComplaint = (complaintData: Omit<Complaint, 'id' | 'date' | 'status'>) => {
    const newComplaint: Complaint = {
        ...complaintData,
        id: `c${Date.now()}`,
        date: new Date().toISOString(),
        status: 'submitted',
    };
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const makePayment = (amount: number): Promise<Payment> => {
    return new Promise((resolve, reject) => {
      const basePayment = {
        id: `TXN${Date.now()}`,
        date: new Date().toISOString(),
        amount: amount,
      };

      // Simulate network delay and potential failure
      setTimeout(() => {
        const isSuccess = false; // Always fail for testing

        if (isSuccess) {
          const successfulPayment: Payment = { ...basePayment, status: 'paid' };
          setPayments(prev => [successfulPayment, ...prev]);
          setOutstandingBalance(prev => Math.max(0, prev - amount));
          resolve(successfulPayment);
        } else {
          const failedPayment: Payment = { ...basePayment, status: 'failed' };
          setPayments(prev => [failedPayment, ...prev]);
          reject(failedPayment);
        }
      }, 3000); // 3-second verification simulation
    });
  };

  const value = {
    user,
    login,
    logout,
    language,
    setLanguage,
    t,
    outstandingBalance,
    addWasteLog,
    wasteLogs,
    addBooking,
    bookings,
    pickupHistory,
    complaints,
    addComplaint,
    theme,
    toggleTheme,
    payments,
    makePayment,
  };

  return React.createElement(AppContext.Provider, { value: value }, children);
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};