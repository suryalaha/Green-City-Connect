import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { useTranslations } from '../hooks/useTranslations';

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const { t } = useTranslations();

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return t('chatbotGreetingMorning');
    } else if (hour >= 12 && hour < 17) {
      return t('chatbotGreetingAfternoon');
    } else {
      return t('chatbotGreetingEvening');
    }
  };
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: getGreetingMessage(), sender: 'bot', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponseText = await getChatbotResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I am having trouble connecting. Please try again later.',
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 mb-4 mr-4 w-80 h-[28rem] z-50 flex flex-col bg-card dark:bg-dark-card rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
      <header className="flex items-center justify-between p-4 bg-primary dark:bg-dark-primary text-white rounded-t-lg">
        <h3 className="text-lg font-semibold">AI Assistant</h3>
        <button onClick={onClose} aria-label="Close chat">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-3 py-2 max-w-xs ${
              msg.sender === 'user'
                ? 'bg-primary dark:bg-dark-primary text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-text dark:text-dark-text'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start mb-3">
                 <div className="rounded-lg px-3 py-2 max-w-xs bg-gray-200 dark:bg-gray-600 text-text dark:text-dark-text">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-4 py-2 bg-primary dark:bg-dark-primary text-white rounded-r-md hover:bg-primary-dark disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chatbot;