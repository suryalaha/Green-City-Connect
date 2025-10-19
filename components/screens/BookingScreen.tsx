import React, { useState, useReducer } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';
import { Booking, Payment } from '../../types';

// --- STATE MANAGEMENT (useReducer) ---

interface State {
  modal: 'none' | 'payment' | 'confirmation' | 'failed';
  isVerifying: boolean;
  activeBooking: Booking | null;
}

type Action =
  | { type: 'START_BOOKING_PAYMENT'; payload: Booking }
  | { type: 'START_VERIFICATION' }
  | { type: 'VERIFICATION_SUCCESS'; payload: Booking }
  | { type: 'VERIFICATION_FAILURE'; payload: Booking }
  | { type: 'CLOSE_MODALS' };

const initialState: State = {
  modal: 'none',
  isVerifying: false,
  activeBooking: null,
};

function bookingReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_BOOKING_PAYMENT':
      return { ...state, modal: 'payment', activeBooking: action.payload };
    case 'START_VERIFICATION':
      return { ...state, modal: 'none', isVerifying: true };
    case 'VERIFICATION_SUCCESS':
      return { ...state, isVerifying: false, modal: 'confirmation', activeBooking: action.payload };
    case 'VERIFICATION_FAILURE':
       return { ...state, isVerifying: false, modal: 'failed', activeBooking: action.payload };
    case 'CLOSE_MODALS':
      return { ...initialState }; // Reset completely
    default:
      return state;
  }
}

// --- UI COMPONENTS ---

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5
 0 0 1 10 0v4"></path>
    </svg>
);

const BookingStatusBadge: React.FC<{ status: Booking['status']; t: (key: string) => string; }> = ({ status, t }) => {
    const statusMap = {
        scheduled: { text: t('statusScheduled'), style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        completed: { text: t('statusCompleted'), style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        cancelled: { text: t('statusCancelled'), style: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    };
    const { text, style } = statusMap[status];
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>{text}</span>;
};

const PaymentStatusBadge: React.FC<{ status: Booking['paymentStatus']; t: (key: string) => string; }> = ({ status, t }) => {
    const statusMap = {
        paid: { text: t('statusPaid'), style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        unpaid: { text: t('statusUnpaid'), style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        failed: { text: t('statusFailed'), style: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    };
    if (!status) return null;
    const { text, style } = statusMap[status];
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>{text}</span>;
};


const PaymentModal: React.FC<{ onClose: () => void; booking: Booking; upiId: string; payeeName: string; t: (key: any) => string; }> = ({ onClose, booking, upiId, payeeName, t }) => {
    const amount = booking.amount || 150.00;
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(t('specialCollectionBooking'))}`;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm text-center relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-xl font-semibold mb-4">{t('bookingPaymentTitle')}</h2>
                <img src={qrCodeApiUrl} alt="UPI QR Code" className="mx-auto mb-4 border rounded-lg" />
                <p className="text-sm">{t('payingTo')}: {payeeName}</p>
                <p className="font-bold text-lg mb-4">{t('bookingAmount')}: ₹{amount.toFixed(2)}</p>
                <a href={upiUrl} className="block w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors mb-2">
                    {t('makePayment')}
                </a>
                <p className="text-xs text-gray-500 mb-4">{t('paymentModalInfo')}</p>
                <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"><LockIcon className="w-4 h-4 mr-1" /><span>{t('securePayment')}</span></div>
            </Card>
        </div>
    );
};

const ConfirmationModal: React.FC<{ onClose: () => void; booking: Booking; t: (key: any) => string; }> = ({ onClose, booking, t }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('bookingPaymentSuccess')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('bookingPaymentSuccessDesc')}</p>
                <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between"><span>{t('date')}:</span> <span>{new Date(booking.date).toLocaleDateString()} at {booking.time}</span></div>
                    <div className="flex justify-between"><span>{t('amountPaid')}:</span> <span className="font-bold">₹{booking.amount?.toFixed(2)}</span></div>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors">{t('done')}</button>
            </Card>
        </div>
    );
};

const PaymentFailedModal: React.FC<{ onClose: () => void; onRetry: () => void; t: (key: any) => string; }> = ({ onClose, onRetry, t }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('bookingPaymentFailed')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('bookingPaymentFailedDesc')}</p>
            <div className="flex space-x-4">
                <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 py-2 rounded-md">{t('close')}</button>
                <button onClick={onRetry} className="w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md">{t('tryAgain')}</button>
            </div>
        </Card>
    </div>
);


// --- MAIN COMPONENT ---

const BookingScreen: React.FC = () => {
    const { t } = useTranslations();
    const { addBooking, bookings, payForBooking } = useAppContext();
    const [state, dispatch] = useReducer(bookingReducer, initialState);

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(true);

    const resetForm = () => {
        setDate('');
        setTime('');
        setNotes('');
        setReminderEnabled(true);
    };

    const handlePaymentProcess = async (booking: Booking) => {
        dispatch({ type: 'START_VERIFICATION' });
        try {
            await payForBooking(booking.id);
            dispatch({ type: 'VERIFICATION_SUCCESS', payload: booking });
        } catch {
            dispatch({ type: 'VERIFICATION_FAILURE', payload: booking });
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) {
            alert('Please select a date and time.');
            return;
        }
        const newBooking = addBooking({ date, time, notes, reminderEnabled });
        dispatch({ type: 'START_BOOKING_PAYMENT', payload: newBooking });
        resetForm();
    };
    
    const handlePayForExistingBooking = (booking: Booking) => {
         dispatch({ type: 'START_BOOKING_PAYMENT', payload: booking });
    };

    return (
        <div>
            {state.modal === 'payment' && state.activeBooking && <PaymentModal onClose={() => handlePaymentProcess(state.activeBooking!)} booking={state.activeBooking} upiId="suryalaha@upi" payeeName="Green City Connect" t={t} />}
            {state.modal === 'confirmation' && state.activeBooking && <ConfirmationModal onClose={() => dispatch({ type: 'CLOSE_MODALS' })} booking={state.activeBooking} t={t} />}
            {state.modal === 'failed' && state.activeBooking && <PaymentFailedModal onClose={() => dispatch({ type: 'CLOSE_MODALS' })} onRetry={() => handlePaymentProcess(state.activeBooking!)} t={t} />}

            <h1 className="text-3xl font-bold mb-2">{t('specialCollectionBooking')}</h1>
            <p className="text-md mb-6 text-gray-600 dark:text-gray-300">{t('bookForEvents')}</p>
            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="date">{t('selectDate')}</label>
                            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="time">{t('selectTime')}</label>
                            <input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1" htmlFor="notes">{t('additionalNotes')}</label>
                        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600" placeholder={t('notesPlaceholder')} rows={3} />
                    </div>
                     <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-2">{t('bookingReminders')}</h3>
                        <div className="flex justify-between items-center">
                            <span>{t('bookingReminderDesc')}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={reminderEnabled} onChange={() => setReminderEnabled(!reminderEnabled)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                    <button type="submit" disabled={state.isVerifying} className="w-full bg-primary dark:bg-dark-primary text-white py-3 rounded-md hover:bg-primary-dark transition-colors font-semibold disabled:bg-gray-400">
                        {state.isVerifying ? t('verifyingPayment') : t('confirmAndPay')}
                    </button>
                </form>
            </Card>

            <Card className="mt-6">
                <h2 className="text-xl font-semibold mb-4">{t('bookingHistoryTitle')}</h2>
                {bookings.length > 0 ? (
                    <ul className="space-y-4">
                        {[...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(booking => (
                            <li key={booking.id} className="p-3 bg-background dark:bg-dark-background rounded-lg border dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                                    <div>
                                        <p className="font-semibold">{new Date(booking.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} at {booking.time}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <BookingStatusBadge status={booking.status} t={t} />
                                            <PaymentStatusBadge status={booking.paymentStatus} t={t} />
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:mt-0 sm:text-right">
                                        <p className="font-semibold">₹{booking.amount?.toFixed(2)}</p>
                                        {(booking.paymentStatus === 'unpaid' || booking.paymentStatus === 'failed') && (
                                            <button onClick={() => handlePayForExistingBooking(booking)} className="text-sm text-primary dark:text-dark-primary hover:underline mt-1">{t('payNow')}</button>
                                        )}
                                    </div>
                                </div>
                                {booking.notes && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 pt-2 border-t dark:border-gray-700">{booking.notes}</p>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-center text-gray-500 py-4">{t('noBookingHistory')}</p>
                )}
            </Card>
        </div>
    );
};

export default BookingScreen;