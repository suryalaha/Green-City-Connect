import React, { useState } from 'react';
import Card from '../ui/Card';
import { Payment } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';

const payments: Payment[] = [
    { id: '1', date: '2024-07-01', amount: 75.00, status: 'paid' },
    { id: '2', date: '2024-06-01', amount: 75.00, status: 'paid' },
    { id: '3', date: '2024-05-01', amount: 75.00, status: 'paid' },
];

const QrCodeModal: React.FC<{ onClose: () => void; amount: number; upiId: string; payeeName: string; t: (key: any) => string; }> = ({ onClose, amount, upiId, payeeName, t }) => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(t('monthlyFee'))}`;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-xs text-center">
                <h2 className="text-xl font-semibold mb-4">{t('scanToPay')}</h2>
                <img src={qrCodeApiUrl} alt="UPI QR Code" className="mx-auto mb-4 border rounded-lg" />
                <p className="text-sm mb-1">{t('payingTo')}: {payeeName}</p>
                <p className="text-sm mb-4">{t('amount')}: ₹{amount.toFixed(2)}</p>
                <button onClick={onClose} className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors">
                    {t('close')}
                </button>
            </Card>
        </div>
    );
};


const PaymentScreen: React.FC = () => {
    const { t } = useTranslations();
    const { outstandingBalance } = useAppContext();
    const [showQrModal, setShowQrModal] = useState(false);
    const [autoRenewal, setAutoRenewal] = useState(true);

    const payeeName = "Green City Connect";
    const transactionNote = t('monthlyFee');
    const upiUrl = `upi://pay?pa=suryalaha@upi&pn=${encodeURIComponent(payeeName)}&am=${outstandingBalance.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

    return (
        <div>
            {showQrModal && <QrCodeModal onClose={() => setShowQrModal(false)} amount={outstandingBalance} upiId="suryalaha@upi" payeeName="Green City Connect" t={t} />}

            <h1 className="text-3xl font-bold mb-4">{t('payment')}</h1>
            <Card>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">{t('outstandingBalance')}</h2>
                        <p className="text-3xl font-bold text-red-500">₹{outstandingBalance.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                         <a 
                           href={upiUrl}
                           className="bg-primary dark:bg-dark-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark text-center"
                           target="_blank"
                           rel="noopener noreferrer"
                         >
                            {t('makePayment')}
                         </a>
                         <button onClick={() => setShowQrModal(true)} className="bg-secondary text-white px-6 py-2 rounded-lg hover:opacity-90">{t('showQRCode')}</button>
                    </div>
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
                <ul>
                    {payments.map(p => (
                        <li key={p.id} className="flex justify-between items-center py-3 border-b dark:border-gray-700 last:border-b-0">
                            <div>
                                <p>{t('paymentOn')} {new Date(p.date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-500">ID: {p.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">₹{p.amount.toFixed(2)}</p>
                                <span className={`text-sm px-2 py-1 rounded-full ${p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t('paid')}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default PaymentScreen;