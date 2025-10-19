import React, { useState } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';

const faqs = [
    { q: 'faqQ1', a: 'faqA1' },
    { q: 'faqQ2', a: 'faqA2' },
    { q: 'faqQ3', a: 'faqA3' },
    { q: 'faqQ4', a: 'faqA4' },
    { q: 'faqQ5', a: 'faqA5' },
    { q: 'faqQ6', a: 'faqA6' },
];

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const FAQItem: React.FC<{
    faq: { q: string, a: string };
    index: number;
    activeIndex: number | null;
    setActiveIndex: (index: number | null) => void;
}> = ({ faq, index, activeIndex, setActiveIndex }) => {
    const { t } = useTranslations();
    const isOpen = index === activeIndex;

    const toggleAccordion = () => {
        setActiveIndex(isOpen ? null : index);
    };

    return (
        <div className="border-b dark:border-gray-700 last:border-b-0">
            <button
                onClick={toggleAccordion}
                className="w-full flex justify-between items-center text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-foreground dark:text-dark-foreground">{t(faq.q)}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-4 pt-0">
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{t(faq.a)}</p>
                </div>
            </div>
        </div>
    );
};

const HelpScreen: React.FC = () => {
    const { t } = useTranslations();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">{t('helpTitle')}</h1>
            <p className="text-md mb-6 text-gray-600 dark:text-gray-300">{t('helpSubtitle')}</p>

            <Card className="p-0">
                {faqs.map((faq, index) => (
                    <FAQItem
                        key={index}
                        faq={faq}
                        index={index}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                    />
                ))}
            </Card>
        </div>
    );
};

export default HelpScreen;