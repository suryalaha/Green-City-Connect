import React, { useEffect, useMemo, useRef } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';
import { User, AdminMessage, Announcement } from '../../types';

type UnifiedMessage = {
    id: string;
    type: 'direct' | 'community';
    text: string;
    title?: string;
    timestamp: number;
};

const InboxScreen: React.FC = () => {
    const { t } = useTranslations();
    const { loggedInUser, adminMessages, announcements, markMessagesAsRead } = useAppContext();
    const user = loggedInUser as User;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            markMessagesAsRead(user.id);
        }
    }, [user, markMessagesAsRead]);
    
    const unifiedMessages = useMemo(() => {
        const direct: UnifiedMessage[] = adminMessages
            .filter(msg => msg.userId === user.id)
            .map(msg => ({
                id: msg.id,
                type: 'direct',
                text: msg.text,
                timestamp: msg.timestamp
            }));

        const community: UnifiedMessage[] = announcements.map(anno => ({
            id: anno.id,
            type: 'community',
            text: anno.content,
            title: anno.title,
            timestamp: anno.timestamp
        }));
        
        return [...direct, ...community].sort((a, b) => a.timestamp - b.timestamp);
    }, [adminMessages, announcements, user.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [unifiedMessages]);


    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{t('inboxTitle')}</h1>
            <Card>
                <div className="h-[calc(100vh-14rem)] flex flex-col">
                    <div className="flex-grow overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {unifiedMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-center text-gray-500">{t('noMessages')}</p>
                            </div>
                        ) : (
                            unifiedMessages.map(msg => (
                                <div key={msg.id} className="flex justify-start mb-4">
                                    <div className={`rounded-lg px-4 py-2 max-w-md ${msg.type === 'direct' ? 'bg-secondary text-white' : 'bg-blue-500 text-white'}`}>
                                        <div className="flex items-center space-x-2 mb-1">
                                            {msg.type === 'community' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v1a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <span className="text-xs font-semibold">{msg.type === 'community' ? t('communityMessage') : t('directMessage')}</span>
                                        </div>
                                        {msg.title && <p className="font-bold text-md">{msg.title}</p>}
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