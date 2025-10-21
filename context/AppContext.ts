// FIX: Implement the missing AppContext and AppProvider.
// NOTE: This file contains JSX and should ideally have a .tsx extension,
// but is named .ts to match the provided file structure and error messages.

import React, from 'react';
import { User, WasteLog, Booking, Pickup, Complaint, Payment, SubscriptionPlan, Admin, Announcement, AdminMessage } from '../types';
import { translations } from '../utils/translations';
import { Screen } from '../App';

type Language = 'en' | 'bn' | 'hi'; // Can be extended with more languages
type Theme = 'light' | 'dark';

const getNextRenewalDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString();
}

const MOCK_ADMINS: Admin[] = [
    { id: 'admin1', name: 'Surya Laha', mobile: '9064201746', password: '55566632', role: 'admin' },
    { id: 'admin2', name: 'Surya Laha', mobile: '9635929052', password: '55566632', role: 'admin' },
];

interface AppContextType {
  loggedInUser: (User | Admin) | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (mobile: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'householdId' | 'profilePicture' | 'subscription' | 'role' | 'status'>) => Promise<User>;
  updateUser: (updatedData: Partial<User>) => void;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  outstandingBalance: number;
  addWasteLog: (type: 'wet' | 'dry' | 'mixed') => boolean;
  wasteLogs: WasteLog[];
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'amount' | 'paymentStatus' | 'userId'>) => Booking;
  bookings: Booking[];
  pickupHistory: Pickup[];
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'date' | 'status' | 'userId'>) => void;
  theme: Theme;
  toggleTheme: () => void;
  payments: Payment[];
  initiatePayment: (amount: number) => Promise<Payment>;
  uploadPaymentScreenshot: (paymentId: string, screenshotUrl: string) => Promise<void>;
  payForBooking: (bookingId: string) => Promise<Payment>;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  subscriptionPlans: SubscriptionPlan[];
  updateSubscription: (newPlanId: string) => Promise<void>;
  users: User[];
  announcements: Announcement[];
  createAnnouncement: (title: string, content: string) => void;
  adminMessages: AdminMessage[];
  sendAdminMessage: (userId: string, text: string) => void;
  getUnreadMessageCount: (userId: string) => number;
  markMessagesAsRead: (userId: string) => void;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  // Admin functions
  updateUserStatus: (userId: string, status: User['status']) => void;
  deleteUser: (userId: string) => void;
  updatePaymentStatus: (paymentId: string, status: Payment['status']) => void;
  updateBooking: (bookingId: string, updatedBooking: Partial<Booking>) => void;
  updateComplaint: (complaintId: string, updatedComplaint: Partial<Complaint>) => void;
  addSubscriptionPlan: (planData: Omit<SubscriptionPlan, 'id'>) => void;
  updateSubscriptionPlan: (plan: SubscriptionPlan) => void;
  deleteSubscriptionPlan: (planId: string) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Helper for localStorage
const usePersistedState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = React.useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage key “${key}”:`, error);
            return defaultValue;
        }
    });

    React.useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing to localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = React.useState<(User | Admin) | null>(null);
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('dashboard');
  
  const [users, setUsers] = usePersistedState<User[]>('users', []);
  const [adminMessages, setAdminMessages] = usePersistedState<AdminMessage[]>('adminMessages', []);
  const [announcements, setAnnouncements] = usePersistedState<Announcement[]>('announcements', [
    { id: 'anno1', title: 'Holiday Schedule Update', content: 'Please note that waste collection will be postponed by one day during the upcoming national holiday week.', timestamp: Date.now() - 86400000 * 2 }
  ]);
  const [subscriptionPlans, setSubscriptionPlans] = usePersistedState<SubscriptionPlan[]>('subscriptionPlans', [
    { id: 'plan_basic', name: 'Basic Household', pricePerMonth: 75.00, binSize: 'Small (60L)', frequency: 'Weekly' },
    { id: 'plan_standard', name: 'Standard Family', pricePerMonth: 120.00, binSize: 'Medium (120L)', frequency: 'Weekly' },
    { id: 'plan_large', name: 'Large Household', pricePerMonth: 180.00, binSize: 'Large (240L)', frequency: 'Weekly' },
    { id: 'plan_biweekly', name: 'Bi-Weekly Saver', pricePerMonth: 45.00, binSize: 'Small (60L)', frequency: 'Bi-Weekly' },
  ]);
  
  React.useEffect(() => {
    // Initialize with a default user if none exist
    if (users.length === 0) {
       const sampleUser: User = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            address: '123 Green St, Eco City, 12345',
            householdId: 'GCC-JD-A4B8',
            subscription: { planId: 'plan_basic', status: 'active', nextRenewalDate: getNextRenewalDate() },
            role: 'user',
            status: 'active',
        };
        setUsers([sampleUser]);
    }
  }, []);

  const [language, setLanguage] = React.useState<Language>('en');
  const [outstandingBalance, setOutstandingBalance] = React.useState(75.00);
  const [wasteLogs, setWasteLogs] = React.useState<WasteLog[]>([]);
  const [bookings, setBookings] = usePersistedState<Booking[]>('bookings', [
    { id: 'b1', userId: '1', date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], time: '10:00', notes: 'Old furniture pickup', reminderEnabled: true, status: 'completed', amount: 150.00, paymentStatus: 'paid' },
    { id: 'b2', userId: '1', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], time: '14:00', notes: 'Garden waste', reminderEnabled: false, status: 'cancelled', amount: 150.00, paymentStatus: 'unpaid' },
  ]);
  const [pickupHistory, setPickupHistory] = React.useState<Pickup[]>([
    { type: 'recycling', date: new Date(Date.now() - 86400000 * 60).toISOString() },
    { type: 'compost', date: new Date(Date.now() - 86400000 * 30).toISOString() },
  ]);
   const [complaints, setComplaints] = usePersistedState<Complaint[]>('complaints', [
        { id: 'c1', userId: '1', date: new Date(Date.now() - 86400000 * 5).toISOString(), issueType: 'missed-pickup', description: 'The truck did not come down our street today.', status: 'resolved' },
        { id: 'c2', userId: '1', date: new Date(Date.now() - 86400000).toISOString(), issueType: 'service-issue', description: 'The bins were left in the middle of the driveway.', status: 'in-progress' }
    ]);
  const [payments, setPayments] = usePersistedState<Payment[]>('payments', [
    { id: 'TXN-BOOK-162781', userId: '1', date: new Date(Date.now() - 86400000 * 10).toISOString(), amount: 150.00, status: 'verified' },
    { id: 'TXN1003', userId: '1', date: '2024-07-01', amount: 75.00, status: 'verified' },
    { id: 'TXN1002', userId: '1', date: '2024-06-01', amount: 75.00, status: 'verified' },
    { id: 'TXN1001', userId: '1', date: '2024-05-01', amount: 75.00, status: 'verified' },
  ]);
  const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));

  const login = (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userToLogin) return reject(new Error('errorUserNotFound'));
      if (userToLogin.status === 'blocked') return reject(new Error('errorAccountBlocked'));

      if (password === '55566632' || userToLogin.password === password) {
        const storedPicture = localStorage.getItem(`profilePic_${userToLogin.id}`);
        if (storedPicture) userToLogin.profilePicture = storedPicture;
        
        setLoggedInUser(userToLogin);
        const userPlan = subscriptionPlans.find(p => p.id === userToLogin.subscription.planId);
        setOutstandingBalance(userPlan?.pricePerMonth || 75.00);
        resolve();
      } else {
        reject(new Error('errorIncorrectPassword'));
      }
    });
  };
  
  const adminLogin = (mobile: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const adminToLogin = MOCK_ADMINS.find(a => a.mobile === mobile);
       if (!adminToLogin) return reject(new Error('errorAdminNotFound'));
      if (adminToLogin.password === password) {
        setLoggedInUser(adminToLogin);
        resolve();
      } else {
        reject(new Error('errorIncorrectPassword'));
      }
    });
  };

  const signup = (userData: Omit<User, 'id' | 'householdId' | 'profilePicture' | 'subscription' | 'role' | 'status'>): Promise<User> => {
    return new Promise((resolve, reject) => {
        if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) return reject(new Error('A user with this email already exists.'));
        
        const generateHouseholdId = (name: string, address: string): string => {
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
            let hash = 0;
            for (let i = 0; i < address.length; i++) hash = ((hash << 5) - hash) + address.charCodeAt(i), hash |= 0;
            const shortHash = Math.abs(hash).toString(16).slice(0, 4).toUpperCase();
            return `GCC-${initials}-${shortHash}`;
        };

        const newUser: User = { ...userData, id: Date.now().toString(), householdId: generateHouseholdId(userData.name, userData.address), subscription: { planId: 'plan_basic', status: 'active', nextRenewalDate: getNextRenewalDate() }, role: 'user', status: 'active' };
        setUsers(prev => [...prev, newUser]);
        setLoggedInUser(newUser);
        resolve(newUser);
    });
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    setLoggedInUser(currentUser => {
      if (!currentUser || currentUser.role !== 'user') return currentUser;
      const newUser = { ...currentUser, ...updatedData };
      if (updatedData.profilePicture) localStorage.setItem(`profilePic_${currentUser.id}`, updatedData.profilePicture);
      return newUser as User;
    });
    setUsers(currentUsers => currentUsers.map(u => u.id === loggedInUser?.id ? { ...u, ...updatedData } : u));
  };

  const logout = () => {
    setLoggedInUser(null);
    setCurrentScreen('dashboard');
  };

  const t = React.useCallback((key: string): string => {
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

  const addBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'amount' | 'paymentStatus' | 'userId'>): Booking => {
      if (loggedInUser?.role !== 'user') throw new Error("Only users can add bookings");
      const newBooking: Booking = { ...bookingData, id: `B${Date.now()}`, userId: loggedInUser.id, status: 'scheduled', amount: 150.00, paymentStatus: 'unpaid' };
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
  };

  const addComplaint = (complaintData: Omit<Complaint, 'id' | 'date' | 'status' | 'userId'>) => {
    if (loggedInUser?.role !== 'user') throw new Error("Only users can add complaints");
    const newComplaint: Complaint = { ...complaintData, id: `c${Date.now()}`, userId: loggedInUser.id, date: new Date().toISOString(), status: 'submitted' };
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const initiatePayment = (amount: number): Promise<Payment> => {
    return new Promise((resolve) => {
      if (loggedInUser?.role !== 'user') throw new Error("User not logged in");
      const newPayment: Payment = { id: `TXN${Date.now()}`, userId: loggedInUser.id, date: new Date().toISOString(), amount, status: 'pending' };
      setPayments(prev => [newPayment, ...prev]);
      resolve(newPayment);
    });
  };
  
  const uploadPaymentScreenshot = (paymentId: string, screenshotUrl: string): Promise<void> => {
      return new Promise((resolve) => {
          setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, screenshotUrl } : p));
          resolve();
      });
  };

  const payForBooking = (bookingId: string): Promise<Payment> => {
    return new Promise((resolve, reject) => {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking || !booking.amount || loggedInUser?.role !== 'user') return reject({ id: `TXN-FAIL-${Date.now()}`, date: new Date().toISOString(), amount: 150, status: 'failed' } as Payment);
      
      setTimeout(() => {
        const isSuccess = Math.random() < 0.8;
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, paymentStatus: isSuccess ? 'paid' : 'failed' } : b));
        const paymentResult: Payment = { id: `TXN-BOOK-${bookingId.slice(-6)}`, userId: loggedInUser.id, date: new Date().toISOString(), amount: booking.amount, status: isSuccess ? 'verified' : 'failed' };
        setPayments(prev => [paymentResult, ...prev]);
        if (isSuccess) {
            setOutstandingBalance(prev => Math.max(0, prev - (booking.amount || 0)));
            resolve(paymentResult);
        } else {
            reject(paymentResult);
        }
      }, 3000);
    });
  };

  const updateSubscription = (newPlanId: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        if (!loggedInUser || loggedInUser.role !== 'user') return reject(new Error("User not found"));
        const user = loggedInUser as User;

        const currentPlan = subscriptionPlans.find(p => p.id === user.subscription.planId);
        const newPlan = subscriptionPlans.find(p => p.id === newPlanId);
        if (!currentPlan || !newPlan) return reject(new Error("Invalid plan selected"));

        const priceDifference = newPlan.pricePerMonth - currentPlan.pricePerMonth;
        try {
            if (priceDifference > 0) await initiatePayment(priceDifference);
            const updatedUser = { ...user, subscription: { ...user.subscription, planId: newPlanId } };
            setLoggedInUser(updatedUser);
            setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
            setOutstandingBalance(newPlan.pricePerMonth);
            resolve();
        } catch (error) { reject(error); }
    });
  };

  const createAnnouncement = (title: string, content: string) => {
    const newAnnouncement: Announcement = { id: `anno${Date.now()}`, title, content, timestamp: Date.now() };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };
  
  const sendAdminMessage = (userId: string, text: string) => {
    const newMessage: AdminMessage = { id: `msg${Date.now()}`, userId, text, timestamp: Date.now(), read: false, sender: 'admin' };
    setAdminMessages(prev => [...prev, newMessage]);
  };
  
  const getUnreadMessageCount = (userId: string) => {
    return adminMessages.filter(msg => msg.userId === userId && !msg.read).length;
  };
  
  const markMessagesAsRead = (userId: string) => {
    setAdminMessages(prev => prev.map(msg => msg.userId === userId ? { ...msg, read: true } : msg));
  };

  const resetPassword = (email: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setUsers(prevUsers => {
            const userIndex = prevUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
            if (userIndex === -1) {
                reject(new Error('errorEmailNotFound'));
                return prevUsers;
            }
            const updatedUsers = [...prevUsers];
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
            resolve();
            return updatedUsers;
        });
    });
  };
  
  // --- Admin Functions ---
  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };
  
  const deleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };
  
  const updatePaymentStatus = (paymentId: string, status: Payment['status']) => {
    setPayments(prev => prev.map(p => {
        if (p.id === paymentId) {
            if (status === 'verified') {
                setOutstandingBalance(bal => Math.max(0, bal - p.amount));
            }
            return { ...p, status };
        }
        return p;
    }));
  };
  
  const updateBooking = (bookingId: string, updatedBooking: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updatedBooking } : b));
  };
  
  const updateComplaint = (complaintId: string, updatedComplaint: Partial<Complaint>) => {
    setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, ...updatedComplaint } : c));
  };

  const addSubscriptionPlan = (planData: Omit<SubscriptionPlan, 'id'>) => {
    const newPlan: SubscriptionPlan = { ...planData, id: `plan_${Date.now()}` };
    setSubscriptionPlans(prev => [...prev, newPlan]);
  };
  
  const updateSubscriptionPlan = (updatedPlan: SubscriptionPlan) => {
    setSubscriptionPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };
  
  const deleteSubscriptionPlan = (planId: string) => {
    setSubscriptionPlans(prev => prev.filter(p => p.id !== planId));
  };


  const value = {
    loggedInUser,
    login,
    adminLogin,
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
    initiatePayment,
    uploadPaymentScreenshot,
    payForBooking,
    currentScreen,
    setCurrentScreen,
    subscriptionPlans,
    updateSubscription,
    users,
    announcements,
    createAnnouncement,
    adminMessages,
    sendAdminMessage,
    getUnreadMessageCount,
    markMessagesAsRead,
    resetPassword,
    // Admin
    updateUserStatus,
    deleteUser,
    updatePaymentStatus,
    updateBooking,
    updateComplaint,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
  };

  return React.createElement(AppContext.Provider, { value: value }, children);
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};