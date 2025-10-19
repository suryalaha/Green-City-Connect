import React, { useState } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';
import { Booking } from '../../types';

const BookingStatusBadge: React.FC<{ status: Booking['status']; t: (key: string) => string; }> = ({ status, t }) => {
    const statusMap = {
        scheduled: { text: t('statusScheduled'), style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        completed: { text: t('statusCompleted'), style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        cancelled: { text: t('statusCancelled'), style: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    };
    const { text, style } = statusMap[status];
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>{text}</span>;
};

const BookingScreen: React.FC = () => {
    const { t } = useTranslations();
    const { addBooking, bookings } = useAppContext();

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) {
            alert('Please select a date and time.');
            return;
        }

        addBooking({ date, time, notes, reminderEnabled });
        
        const confirmationMessage = t('bookingConfirmedDesc')
            .replace('{date}', new Date(date).toLocaleDateString())
            .replace('{time}', time);
            
        alert(`${t('bookingConfirmed')}\n${confirmationMessage}`);

        // Reset form
        setDate('');
        setTime('');
        setNotes('');
        setReminderEnabled(true);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">{t('specialCollectionBooking')}</h1>
            <p className="text-md mb-6 text-gray-600 dark:text-gray-300">{t('bookForEvents')}</p>
            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="date">{t('selectDate')}</label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="time">{t('selectTime')}</label>
                            <input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1" htmlFor="notes">{t('additionalNotes')}</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                            placeholder={t('notesPlaceholder')}
                            rows={3}
                        />
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
                    <button
                        type="submit"
                        className="w-full bg-primary dark:bg-dark-primary text-white py-3 rounded-md hover:bg-primary-dark transition-colors font-semibold"
                    >
                        {t('confirmBooking')}
                    </button>
                </form>
            </Card>

            <Card className="mt-6">
                <h2 className="text-xl font-semibold mb-4">{t('bookingHistoryTitle')}</h2>
                {bookings.length > 0 ? (
                    <ul className="space-y-4">
                        {[...bookings]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map(booking => (
                            <li key={booking.id} className="p-3 bg-background dark:bg-dark-background rounded-lg border dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">
                                            {new Date(booking.date).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })} at {booking.time}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{booking.notes || 'No notes provided'}</p>
                                    </div>
                                    <BookingStatusBadge status={booking.status} t={t} />
                                </div>
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