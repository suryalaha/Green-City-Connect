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
  updateUser: (updatedData: Partial<User>) => void;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  outstandingBalance: number;
  addWasteLog: (type: 'wet' | 'dry' | 'mixed') => boolean;
  wasteLogs: WasteLog[];
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'amount' | 'paymentStatus'>) => Booking;
  bookings: Booking[];
  pickupHistory: Pickup[];
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'date' | 'status'>) => void;
  theme: Theme;
  toggleTheme: () => void;
  payments: Payment[];
  makePayment: (amount: number) => Promise<Payment>;
  payForBooking: (bookingId: string) => Promise<Payment>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [outstandingBalance, setOutstandingBalance] = useState(75.00);
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'b1',
      date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
      time: '10:00',
      notes: 'Old furniture pickup',
      reminderEnabled: true,
      status: 'completed',
      amount: 150.00,
      paymentStatus: 'paid',
    },
    {
      id: 'b2',
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      time: '14:00',
      notes: 'Garden waste',
      reminderEnabled: false,
      status: 'cancelled',
      amount: 150.00,
      paymentStatus: 'unpaid',
    },
  ]);
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
    { id: 'TXN-BOOK-162781', date: new Date(Date.now() - 86400000 * 10).toISOString(), amount: 150.00, status: 'paid' },
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
    const storedPicture = localStorage.getItem(`profilePic_${userData.id}`);
    if (storedPicture) {
      userData.profilePicture = storedPicture;
    }
    setUser(userData);
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const newUser = { ...currentUser, ...updatedData };
      
      if (updatedData.profilePicture) {
          localStorage.setItem(`profilePic_${currentUser.id}`, updatedData.profilePicture);
      }
      
      return newUser;
    });
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

  const addBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'amount' | 'paymentStatus'>): Booking => {
      const newBooking: Booking = {
          ...bookingData,
          id: `B${Date.now()}`,
          status: 'scheduled',
          amount: 150.00,
          paymentStatus: 'unpaid',
      };
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
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

      setTimeout(() => {
        const isSuccess = Math.random() < 0.8; 

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
      }, 3000);
    });
  };

  const payForBooking = (bookingId: string): Promise<Payment> => {
    return new Promise((resolve, reject) => {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking || !booking.amount) {
        const failedPayment: Payment = { id: `TXN-FAIL-${Date.now()}`, date: new Date().toISOString(), amount: 150, status: 'failed' };
        reject(failedPayment);
        return;
      }

      const basePayment = {
        id: `TXN-BOOK-${bookingId.slice(-6)}`,
        date: new Date().toISOString(),
        amount: booking.amount,
      };

      setTimeout(() => {
        const isSuccess = Math.random() < 0.8;
        
        setBookings(prev => prev.map(b => 
            b.id === bookingId 
            ? { ...b, paymentStatus: isSuccess ? 'paid' : 'failed' } 
            : b
        ));
        
        if (isSuccess) {
            const successfulPayment: Payment = { ...basePayment, status: 'paid' };
            setPayments(prev => [successfulPayment, ...prev]);
            resolve(successfulPayment);
        } else {
            const failedPayment: Payment = { ...basePayment, status: 'failed' };
            setPayments(prev => [failedPayment, ...prev]);
            reject(failedPayment);
        }
      }, 3000);
    });
  };

  const value = {
    user,
    login,
    updateUser,
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
    payForBooking,
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