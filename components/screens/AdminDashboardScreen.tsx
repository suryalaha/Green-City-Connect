import React, { useState, useEffect, useRef } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';
import { User, AdminMessage } from '../../types';

const ChatModal: React.FC<{
    user: User;
    onClose: () => void;
}> = ({ user, onClose }) => {
    const { t } = useTranslations();
    const { adminMessages, sendAdminMessage } = useAppContext();
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userMessages = adminMessages
        .filter(m => m.userId === user.id)
        .sort((a, b) => a.timestamp - b.timestamp);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [userMessages]);

    const handleSend = () => {
        if (messageText.trim()) {
            sendAdminMessage(user.id, messageText.trim());
            setMessageText('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg h-[80vh] flex flex-col">
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{t('chatWith')} {user.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 my-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {userMessages.length === 0 ? (
                         <p className="text-center text-sm text-gray-500">{t('noMessages')}</p>
                    ) : (
                        userMessages.map(msg => (
                            <div key={msg.id} className="flex justify-end mb-3">
                                <div className="rounded-lg px-3 py-2 max-w-xs bg-primary text-white">
                                    <p className="text-sm">{msg.text}</p>
                                    <p className="text-xs text-right text-white/70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex">
                    <input
                        type="text"
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder={t('typeYourMessage')}
                        className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button onClick={handleSend} className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark">
                        {t('sendMessage')}
                    </button>
                </div>
            </Card>
        </div>
    );
};


const AdminDashboardScreen: React.FC = () => {
    const { t } = useTranslations();
    const { loggedInUser, users, announcements, createAnnouncement, logout } = useAppContext();
    
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handlePostAnnouncement = () => {
        if (announcementTitle.trim() && announcementContent.trim()) {
            createAnnouncement(announcementTitle, announcementContent);
            setAnnouncementTitle('');
            setAnnouncementContent('');
            alert('Announcement posted successfully!');
        } else {
            alert('Please fill in both title and content for the announcement.');
        }
    };

    return (
        <div className="space-y-8">
             {selectedUser && <ChatModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold text-foreground dark:text-dark-foreground">{t('adminDashboard')}</h1>
                    <p className="text-lg mt-1 text-gray-500 dark:text-gray-400">{t('welcome')}, {loggedInUser?.name}!</p>
                </div>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">{t('logout')}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-2xl font-bold text-foreground dark:text-dark-foreground">{users.length}</p>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">{t('totalUsers')}</h3>
                </Card>
                 <Card className="flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-2">📢</div>
                    <p className="text-2xl font-bold text-foreground dark:text-dark-foreground">{announcements.length}</p>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">{t('announcements')}</h3>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-2xl font-semibold mb-4">{t('createAnnouncement')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('announcementTitle')}</label>
                            <input
                                type="text"
                                value={announcementTitle}
                                onChange={e => setAnnouncementTitle(e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('announcementContent')}</label>
                            <textarea
                                value={announcementContent}
                                onChange={e => setAnnouncementContent(e.target.value)}
                                rows={4}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <button onClick={handlePostAnnouncement} className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors">
                            {t('postAnnouncement')}
                        </button>
                    </div>
                </Card>
                <Card>
                     <h2 className="text-2xl font-semibold mb-4">{t('allUsers')}</h2>
                     <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                        {users.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                                <button onClick={() => setSelectedUser(user)} className="text-sm bg-secondary text-white px-3 py-1 rounded-md hover:bg-secondary-dark transition-colors">
                                    {t('sendMessage')}
                                </button>
                            </div>
                        ))}
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardScreen;