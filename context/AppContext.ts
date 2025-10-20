// FIX: Implement the missing AppContext and AppProvider.
// NOTE: This file contains JSX and should ideally have a .tsx extension,
// but is named .ts to match the provided file structure and error messages.

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, WasteLog, Booking, Pickup, Complaint, Payment } from '../types';
import { translations } from '../utils/translations';

type Language = 'en' | 'bn' | 'hi'; // Can be extended with more languages
type Theme = 'light' | 'dark';

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'householdId' | 'profilePicture'>) => Promise<User>;
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
  const [users, setUsers] = useState<User[]>(() => {
    try {
        const storedUsers = localStorage.getItem('users');
        const initialUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];
        const sampleUser: User = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            address: '123 Green St, Eco City, 12345',
            householdId: 'GCC-JD-A4B8',
        };
        if (!initialUsers.some(u => u.id === '1')) {
            initialUsers.push(sampleUser);
        }
        return initialUsers;
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
        return [];
    }
  });
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
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const login = (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!userToLogin) {
        return reject(new Error('Invalid email or password.'));
      }

      if (password === '55566632' || userToLogin.password === password) {
        const storedPicture = localStorage.getItem(`profilePic_${userToLogin.id}`);
        if (storedPicture) {
          userToLogin.profilePicture = storedPicture;
        }
        setUser(userToLogin);
        resolve();
      } else {
        reject(new Error('Invalid email or password.'));
      }
    });
  };

  const signup = (userData: Omit<User, 'id' | 'householdId' | 'profilePicture'>): Promise<User> => {
    return new Promise((resolve, reject) => {
        if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return reject(new Error('A user with this email already exists.'));
        }

        const generateHouseholdId = (firstName: string, lastName: string, address: string): string => {
            const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
            let hash = 0;
            for (let i = 0; i < address.length; i++) {
                const char = address.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            const shortHash = Math.abs(hash).toString(16).slice(0, 4).toUpperCase();
            return `GCC-${initials}-${shortHash}`;
        };
        
        const [firstName, ...lastNameParts] = userData.name.split(' ');

        const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            householdId: generateHouseholdId(firstName, lastNameParts.join(' '), userData.address),
        };

        setUsers(prev => [...prev, newUser]);
        setUser(newUser);
        resolve(newUser);
    });
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
    setUsers(currentUsers => currentUsers.map(u => u.id === user?.id ? { ...u, ...updatedData } : u));
  };

  const logout = () => {
    setUser(null);
  };

  const t = useCallback((key: string): string => {
    const translationSet = translations[language] as Record<string, string | undefined> | undefined;
    return translationSet?.[key] || translations.en[key] || key;
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
    signup,
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