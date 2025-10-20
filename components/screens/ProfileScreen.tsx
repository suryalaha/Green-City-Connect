// FIX: Implement the missing ProfileScreen component.
import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { Complaint, SubscriptionPlan, User } from '../../types';

const GreenBadge: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="mt-2 flex items-center space-x-2 rounded-full bg-green-100 dark:bg-green-900/50 px-3 py-1 w-fit">
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
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
    const { loggedInUser, logout, pickupHistory, complaints, addComplaint, theme, toggleTheme, updateUser, setCurrentScreen, subscriptionPlans, getUnreadMessageCount } = useAppContext();
    const user = loggedInUser as User;
    const { t, language, setLanguage } = useTranslations();
    
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    
    const [editedName, setEditedName] = useState(user?.name || '');
    const [editedEmail, setEditedEmail] = useState(user?.email || '');
    const [editedAddress, setEditedAddress] = useState(user?.address || '');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [notifications, setNotifications] = useState({
        push: true,
        email: false,
        sms: true,
    });
    
    const unreadCount = getUnreadMessageCount(user.id);

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

    const handleEditToggle = () => {
        if (!isEditing && user) {
            setEditedName(user.name);
            setEditedEmail((user as User).email);
            setEditedAddress((user as User).address);
        }
        setIsEditing(!isEditing);
    };

    const handleSaveChanges = () => {
        updateUser({
            name: editedName,
            email: editedEmail,
            address: editedAddress,
        });
        setIsEditing(false);
        alert(t('profileUpdatedSuccess'));
    };

    const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            updateUser({ profilePicture: base64String });
        };
        reader.readAsDataURL(file);
    };
    
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const currentPlan = user ? subscriptionPlans.find(p => p.id === (user as User).subscription.planId) : null;

    if (!user || user.role !== 'user') {
        return null; // Or a loading indicator
    }

    return (
        <div className="space-y-6">
            {isComplaintModalOpen && <ComplaintModal onClose={() => setIsComplaintModalOpen(false)} t={t} addComplaint={addComplaint} />}
            <h1 className="text-3xl font-bold">{t('yourProfile')}</h1>
            
            <Card>
                <div className="flex items-center space-x-6">
                     <div className="relative">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <button 
                            onClick={triggerFileUpload}
                            className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1.5 text-white shadow-md hover:bg-teal-600 transition-colors"
                            aria-label={t('changePicture')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePictureUpload} 
                            className="hidden" 
                            accept="image/png, image/jpeg" 
                        />
                    </div>
                    
                    <div className="flex-grow">
                        {isEditing ? (
                            <div className="space-y-2">
                                <input 
                                    type="text" 
                                    value={editedName} 
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="text-xl font-semibold w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    aria-label="Name"
                                />
                                <input 
                                    type="email" 
                                    value={editedEmail} 
                                    onChange={(e) => setEditedEmail(e.target.value)}
                                    className="text-gray-500 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    aria-label="Email"
                                />
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-semibold">{user.name}</h2>
                                <p className="text-gray-500">{user.email}</p>
                                {showGreenBadge && <GreenBadge />}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">{t('address')}</h3>
                    {isEditing ? (
                        <textarea 
                            value={editedAddress} 
                            onChange={(e) => setEditedAddress(e.target.value)}
                            rows={3}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                    ) : (
                        <p>{user.address}</p>
                    )}
                </div>

                <div className="mt-6 border-t dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold mb-2">{t('householdId')}</h3>
                    <p className="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">{user.householdId}</p>
                </div>
                 
                {isEditing ? (
                    <div className="flex justify-end space-x-4 mt-6">
                        <button onClick={handleEditToggle} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('cancel')}</button>
                        <button onClick={handleSaveChanges} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">{t('saveChanges')}</button>
                    </div>
                ) : (
                     <div className="flex justify-end mt-4">
                        <button onClick={handleEditToggle} className="flex items-center space-x-2 text-sm text-primary dark:text-dark-primary hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                            </svg>
                            <span>{t('editProfile')}</span>
                        </button>
                    </div>
                )}
            </Card>

             <Card>
                <button 
                    onClick={() => setCurrentScreen('inbox')}
                    className="w-full flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 -m-6 p-6 rounded-xl"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-secondary/10 dark:bg-secondary/20 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold">{t('inbox')}</h3>
                            <p className="text-sm text-gray-500">{t('viewAdminMessages')}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{unreadCount}</span>
                        )}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            </Card>

            <Card>
                <h3 className="text-lg font-semibold mb-2">{t('currentSubscription')}</h3>
                {currentPlan ? (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{t('plan')}:</span>
                            <span>{currentPlan.name}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="font-medium">{t('binSize')}:</span>
                            <span>{currentPlan.binSize}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="font-medium">{t('monthlyCost')}:</span>
                            <span className="font-bold">₹{currentPlan.pricePerMonth.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="font-medium">{t('nextRenewal')}:</span>
                            <span>{new Date(user.subscription.nextRenewalDate).toLocaleDateString()}</span>
                        </div>
                        <button onClick={() => setCurrentScreen('subscription')} className="w-full mt-2 bg-secondary text-white py-2 rounded-md hover:opacity-90 transition-colors">
                            {t('manageSubscription')}
                        </button>
                    </div>
                ) : (
                    <p>{t('noActiveSubscription')}</p>
                )}
            </Card>

            <Card>
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

            <Card>
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

            <Card>
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
                            onChange={(e) => setLanguage(e.target.value as 'en' | 'bn' | 'hi')}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                        >
                            <option value="en">English</option>
                            <option value="bn">বাংলা (Bengali)</option>
                            <option value="hi">हिंदी (Hindi)</option>
                        </select>
                    </div>
                 </div>
            </Card>

            <Card>
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

            <div className="mt-8 mb-4">
                <button 
                    onClick={logout}
                    className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                    {t('logout')}
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;