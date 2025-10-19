// FIX: Implement the missing ProfileScreen component.
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { Complaint } from '../../types';

const GreenBadge: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="mt-4 flex items-center space-x-2 rounded-full bg-green-100 dark:bg-green-900/50 px-3 py-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-green-800 dark:text-green-300">{t('greenBadge')}</span>
        </div>
    )
}

const StatusBadge: React.FC<{ status: Complaint['status']; t: (key: string) => string; }> = ({ status, t }) => {
    const statusMap = {
        submitted: { text: t('statusSubmitted'), style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        'in-progress': { text: t('statusInProgress'), style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        resolved: { text: t('statusResolved'), style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    };
    const { text, style } = statusMap[status];
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>{text}</span>;
};

const ComplaintModal: React.FC<{
    onClose: () => void;
    t: (key: string) => string;
    addComplaint: (complaint: Omit<Complaint, 'id' | 'date' | 'status'>) => void;
}> = ({ onClose, t, addComplaint }) => {
    const [issueType, setIssueType] = useState<'missed-pickup' | 'service-issue' | 'other'>('missed-pickup');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [fileName, setFileName] = useState('');

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) {
            alert('Please provide a description.');
            return;
        }
        addComplaint({ issueType, description, photo });
        alert(t('complaintSubmittedSuccess'));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">{t('fileComplaintTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('issueType')}</label>
                        <select value={issueType} onChange={(e) => setIssueType(e.target.value as any)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                            <option value="missed-pickup">{t('issueMissedPickup')}</option>
                            <option value="service-issue">{t('issueService')}</option>
                            <option value="other">{t('issueOther')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('description')}</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder={t('describeIssuePlaceholder')} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('uploadPhoto')}</label>
                        <label className="w-full flex items-center px-4 py-2 bg-background dark:bg-dark-background border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                           <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{fileName || 'Choose a file...'}</span>
                           <input type='file' className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                         {photo && <img src={photo} alt="Preview" className="mt-2 rounded-lg max-h-32"/>}
                    </div>
                    <button type="submit" className="w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors">{t('submitComplaint')}</button>
                </form>
            </Card>
        </div>
    );
};

const ProfileScreen: React.FC = () => {
    const { user, logout, pickupHistory, complaints, addComplaint, theme, toggleTheme } = useAppContext();
    const { t, language, setLanguage } = useTranslations();
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [feedback, setFeedback] = useState('');

    const [notifications, setNotifications] = useState({
        push: true,
        email: false,
        sms: true,
    });

    const handleNotificationChange = (type: keyof typeof notifications) => {
        setNotifications(prev => ({...prev, [type]: !prev[type]}));
    };
    
    const showGreenBadge = !pickupHistory.some(p => p.type === 'general');
    
    const getIssueTypeText = (issueType: Complaint['issueType']) => {
        const map = {
            'missed-pickup': t('issueMissedPickup'),
            'service-issue': t('issueService'),
            'other': t('issueOther'),
        };
        return map[issueType];
    }

    const handleFeedbackSubmit = () => {
        if (feedback.trim() === '') {
            alert('Please enter some feedback before submitting.');
            return;
        }
        console.log('--- App Feedback Submitted ---');
        console.log(feedback);
        try {
            const existingFeedback = JSON.parse(localStorage.getItem('appFeedback') || '[]');
            existingFeedback.push({ text: feedback, date: new Date().toISOString() });
            localStorage.setItem('appFeedback', JSON.stringify(existingFeedback));
        } catch (error) {
            console.error("Could not save feedback to localStorage", error);
        }
        
        alert(t('feedbackSubmitted'));
        setFeedback('');
    };


    if (!user) {
        return null; // Or a loading indicator
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{t('yourProfile')}</h1>
            
            <Card>
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <p className="text-gray-500">{user.email}</p>
                         {showGreenBadge && <GreenBadge />}
                    </div>
                </div>
                
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">{t('address')}</h3>
                    <p>{user.address}</p>
                </div>
            </Card>

            <Card className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{t('myComplaints')}</h3>
                    <button onClick={() => setIsComplaintModalOpen(true)} className="text-sm bg-primary text-white px-4 py-1 rounded-md hover:bg-primary-dark transition-colors">
                        {t('fileNewComplaint')}
                    </button>
                </div>
                 {complaints.length > 0 ? (
                    <ul className="space-y-4">
                        {complaints.map(c => (
                            <li key={c.id} className="p-3 bg-background dark:bg-dark-background rounded-lg border dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{getIssueTypeText(c.issueType)}</p>
                                        <p className="text-xs text-gray-500">{new Date(c.date).toLocaleString()}</p>
                                    </div>
                                    <StatusBadge status={c.status} t={t} />
                                </div>
                                <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">{c.description}</p>
                                {c.photo && <img src={c.photo} alt="Complaint evidence" className="mt-2 rounded-lg max-h-32" />}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-center text-gray-500 py-4">{t('noComplaints')}</p>
                )}
            </Card>

            <Card className="mt-6">
                <h3 className="text-lg font-semibold mb-2">{t('appFeedback')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('appFeedbackDescription')}</p>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    placeholder={t('feedbackPlaceholder')}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 mb-4"
                />
                <button
                    onClick={handleFeedbackSubmit}
                    className="w-full bg-secondary text-white py-2 rounded-md hover:opacity-90 transition-colors"
                >
                    {t('submitFeedback')}
                </button>
            </Card>

            <Card className="mt-6">
                 <h3 className="text-lg font-semibold mb-4">{t('settings')}</h3>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span>{t('darkMode')}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                     <div className="flex justify-between items-center">
                        <span>{t('language')}</span>
                         <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value as 'en')}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                            <option value="en">English</option>
                            {/* Add other languages here if needed */}
                        </select>
                    </div>
                 </div>
            </Card>

            <Card className="mt-6">
                <h3 className="text-lg font-semibold mb-2">{t('notifications')}</h3>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span>{t('pushNotifications')}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications.push} onChange={() => handleNotificationChange('push')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                     <div className="flex justify-between items-center">
                        <span>{t('emailNotifications')}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications.email} onChange={() => handleNotificationChange('email')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                     <div className="flex justify-between items-center">
                        <span>{t('smsNotifications')}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications.sms} onChange={() => handleNotificationChange('sms')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>
                 </div>
            </Card>

            <div className="mt-8">
                <button 
                    onClick={logout}
                    className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                    {t('logout')}
                </button>
            </div>
            {isComplaintModalOpen && <ComplaintModal onClose={() => setIsComplaintModalOpen(false)} t={t} addComplaint={addComplaint} />}
        </div>
    );
};

export default ProfileScreen;