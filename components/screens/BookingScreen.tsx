import React, { useState } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';

const BookingScreen: React.FC = () => {
    const { t } = useTranslations();
    const { addBooking } = useAppContext();

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
        </div>
    );
};

export default BookingScreen;