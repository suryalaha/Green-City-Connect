import React, { useEffect, useRef } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';

const InboxScreen: React.FC = () => {
    const { t } = useTranslations();
    const { loggedInUser, adminMessages, markMessagesAsRead } = useAppContext();
    const user = loggedInUser as User;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            markMessagesAsRead(user.id);
        }
    }, [user, markMessagesAsRead]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [adminMessages]);

    const userMessages = adminMessages
        .filter(msg => msg.userId === user.id)
        .sort((a, b) => a.timestamp - b.timestamp);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{t('inboxTitle')}</h1>
            <Card>
                <div className="h-[calc(100vh-14rem)] flex flex-col">
                    <div className="flex-grow overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {userMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-center text-gray-500">{t('noMessages')}</p>
                            </div>
                        ) : (
                            userMessages.map(msg => (
                                <div key={msg.id} className="flex justify-start mb-4">
                                    <div className="rounded-lg px-4 py-2 max-w-md bg-secondary text-white">
                                        <p className="text-sm">{msg.text}</p>
                                        <p className="text-xs text-right text-white/70 mt-1">
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default InboxScreen;