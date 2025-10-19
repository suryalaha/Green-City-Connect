import React, { useState } from 'react';
import Card from '../ui/Card';
import { Payment } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';

const PaymentModal: React.FC<{ onClose: () => void; amount: number; upiId: string; payeeName: string; t: (key: any) => string; }> = ({ onClose, amount, upiId, payeeName, t }) => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(t('monthlyFee'))}`;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm text-center relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-xl font-semibold mb-4">{t('scanToPay')}</h2>
                <img src={qrCodeApiUrl} alt="UPI QR Code" className="mx-auto mb-4 border rounded-lg" />
                <p className="text-sm">{t('payingTo')}: {payeeName}</p>
                <p className="font-bold text-lg mb-4">{t('amount')}: ₹{amount.toFixed(2)}</p>
                <a 
                    href={upiUrl}
                    className="block w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors mb-2"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t('makePayment')}
                </a>
                <p className="text-xs text-gray-500">{t('paymentModalInfo')}</p>
            </Card>
        </div>
    );
};

const ReceiptModal: React.FC<{ onClose: () => void; payment: Payment; t: (key: any) => string; }> = ({ onClose, payment, t }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('paymentSuccessful')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('receiptSent')}</p>
                <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between"><span>{t('transactionId')}:</span> <span className="font-mono">{payment.id}</span></div>
                    <div className="flex justify-between"><span>{t('date')}:</span> <span>{new Date(payment.date).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>{t('amountPaid')}:</span> <span className="font-bold">₹{payment.amount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>{t('paymentMethod')}:</span> <span>{t('upi')}</span></div>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors">
                    {t('done')}
                </button>
            </Card>
        </div>
    );
};


const PaymentScreen: React.FC = () => {
    const { t } = useTranslations();
    const { outstandingBalance, payments, makePayment } = useAppContext();
    
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);
    const [autoRenewal, setAutoRenewal] = useState(true);

    const handlePayNowClick = () => {
        if (outstandingBalance > 0) {
            setShowPaymentModal(true);
        }
    };

    const handlePaymentModalClose = () => {
        setShowPaymentModal(false);
        setIsVerifying(true);

        setTimeout(() => {
            const newPayment = makePayment(outstandingBalance);
            setCompletedPayment(newPayment);
            setIsVerifying(false);
            setShowReceiptModal(true);
        }, 3000); // Simulate 3 second verification
    };
    
    const handleReceiptModalClose = () => {
        setShowReceiptModal(false);
        setCompletedPayment(null);
    };

    const handleDownloadReceipt = (paymentId: string) => {
        alert(`${t('downloading')} ${paymentId}.pdf`);
    };

    return (
        <div>
            {showPaymentModal && <PaymentModal onClose={handlePaymentModalClose} amount={outstandingBalance} upiId="suryalaha@upi" payeeName="Green City Connect" t={t} />}
            {showReceiptModal && completedPayment && <ReceiptModal onClose={handleReceiptModalClose} payment={completedPayment} t={t} />}

            <h1 className="text-3xl font-bold mb-4">{t('payment')}</h1>
            <Card>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">{t('outstandingBalance')}</h2>
                        <p className={`text-3xl font-bold ${outstandingBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            ₹{outstandingBalance.toFixed(2)}
                        </p>
                    </div>
                    <button 
                        onClick={handlePayNowClick}
                        disabled={isVerifying || outstandingBalance <= 0}
                        className="bg-primary dark:bg-dark-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark text-center font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
                    >
                         {isVerifying ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('verifyingPayment')}
                            </>
                         ) : (
                            t('payNow')
                         )}
                    </button>
                </div>
            </Card>

            <Card className="mt-6">
                <h2 className="text-xl font-semibold mb-4">{t('autoRenewalSettings')}</h2>
                 <div className="flex justify-between items-center mb-2">
                    <span>{t('enableAutoRenewal')}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={autoRenewal} onChange={() => setAutoRenewal(!autoRenewal)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('autoRenewalDesc')}</p>
            </Card>

            <Card className="mt-6">
                <h2 className="text-xl font-semibold mb-4">{t('paymentHistory')}</h2>
                <ul className="space-y-2">
                    {payments.map(p => (
                        <li key={p.id} className="flex justify-between items-center py-3 border-b dark:border-gray-700 last:border-b-0">
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.status === 'paid' ? 'bg-green-100' : 'bg-red-100'}`}>
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold">₹{p.amount.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">{t('paymentOn')} {new Date(p.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDownloadReceipt(p.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={t('downloadReceipt')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default PaymentScreen;