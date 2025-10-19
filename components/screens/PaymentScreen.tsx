import React, { useState, useReducer } from 'react';
import Card from '../ui/Card';
import { Payment, User } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';
import jsPDF from 'jspdf';

// --- STATE MANAGEMENT (useReducer) ---

interface State {
  modal: 'none' | 'payment' | 'receipt' | 'failed' | 'details';
  isVerifying: boolean;
  activePayment: Payment | null; // For receipt, failed, or details modal
}

type Action =
  | { type: 'OPEN_PAYMENT_MODAL' }
  | { type: 'START_VERIFICATION' }
  | { type: 'VERIFICATION_SUCCESS'; payload: Payment }
  | { type: 'VERIFICATION_FAILURE'; payload: Payment }
  | { type: 'RETRY_PAYMENT' }
  | { type: 'OPEN_RECEIPT_DETAILS'; payload: Payment }
  | { type: 'CLOSE_ALL_MODALS' };

const initialState: State = {
  modal: 'none',
  isVerifying: false,
  activePayment: null,
};

function paymentReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN_PAYMENT_MODAL':
      return { ...state, modal: 'payment' };
    case 'START_VERIFICATION':
      return { ...state, modal: 'none', isVerifying: true, activePayment: null };
    case 'VERIFICATION_SUCCESS':
      return {
        ...state,
        isVerifying: false,
        modal: 'receipt',
        activePayment: action.payload,
      };
    case 'VERIFICATION_FAILURE':
      return {
        ...state,
        isVerifying: false,
        modal: 'failed',
        activePayment: action.payload,
      };
    case 'RETRY_PAYMENT':
      return { ...state, modal: 'none', isVerifying: true, activePayment: null };
    case 'OPEN_RECEIPT_DETAILS':
      return { ...state, modal: 'details', activePayment: action.payload };
    case 'CLOSE_ALL_MODALS':
      return { ...state, modal: 'none', activePayment: null };
    default:
      return state;
  }
}

// --- UI COMPONENTS ---

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

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
                <p className="text-xs text-gray-500 mb-4">{t('paymentModalInfo')}</p>
                 <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    <LockIcon className="w-4 h-4 mr-1" />
                    <span>{t('securePayment')}</span>
                </div>
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

const ReceiptDetailModal: React.FC<{ onClose: () => void; payment: Payment; user: User | null; t: (key: any) => string; }> = ({ onClose, payment, user, t }) => {
    const handleDownload = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Green City Connect', 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Transaction Receipt', 105, 30, { align: 'center' });

        // Line separator
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Transaction Details
        doc.setFontSize(12);
        let yPos = 50;
        const addDetail = (label: string, value: string) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 80, yPos);
            yPos += 10;
        };

        addDetail(`${t('transactionId')}:`, payment.id);
        addDetail(`${t('date')}:`, new Date(payment.date).toLocaleString());
        if (user?.householdId) {
            addDetail(`${t('householdId')}:`, user.householdId);
        }
        addDetail(`${t('amountPaid')}:`, `₹${payment.amount.toFixed(2)}`);
        addDetail(`${t('paymentMethod')}:`, t('upi'));
        addDetail(`${t('status')}:`, t(payment.status).toUpperCase());

        // Line separator
        doc.line(20, yPos, 190, yPos);
        yPos += 15;

        // Footer
        doc.setFontSize(10);
        doc.text('Thank you for your payment!', 105, yPos, { align: 'center' });

        // Save the PDF
        doc.save(`receipt-${payment.id}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center">{t('transactionReceipt')}</h2>
                <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm mb-6">
                    <div className="flex justify-between"><span>{t('transactionId')}:</span> <span className="font-mono">{payment.id}</span></div>
                    <div className="flex justify-between"><span>{t('date')}:</span> <span>{new Date(payment.date).toLocaleString()}</span></div>
                    {user?.householdId && (
                        <div className="flex justify-between"><span>{t('householdId')}:</span> <span className="font-mono">{user.householdId}</span></div>
                    )}
                    <div className="flex justify-between"><span>{t('amountPaid')}:</span> <span className="font-bold">₹{payment.amount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>{t('paymentMethod')}:</span> <span>{t('upi')}</span></div>
                    <div className="flex justify-between"><span>{t('status')}:</span> <span className="font-semibold text-green-600 dark:text-green-400 capitalize">{t(payment.status)}</span></div>
                </div>
                <div className="flex space-x-4">
                    <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 text-foreground dark:text-dark-foreground py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        {t('close')}
                    </button>
                    <button onClick={handleDownload} className="w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors">
                        {t('downloadPdf')}
                    </button>
                </div>
            </Card>
        </div>
    );
};

const PaymentFailedModal: React.FC<{ onClose: () => void; onRetry: () => void; t: (key: any) => string; }> = ({ onClose, onRetry, t }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('paymentFailed')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('paymentFailedDesc')}</p>
                <div className="flex space-x-4">
                    <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 text-foreground dark:text-dark-foreground py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        {t('close')}
                    </button>
                    <button onClick={onRetry} className="w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors">
                        {t('tryAgain')}
                    </button>
                </div>
            </Card>
        </div>
    );
};

// --- MAIN COMPONENT ---

const PaymentScreen: React.FC = () => {
    const { t } = useTranslations();
    const { user, outstandingBalance, payments, makePayment } = useAppContext();
    
    const [state, dispatch] = useReducer(paymentReducer, initialState);
    const [autoRenewal, setAutoRenewal] = useState(true);

    const handlePayNowClick = () => {
        if (outstandingBalance > 0) {
            dispatch({ type: 'OPEN_PAYMENT_MODAL' });
        }
    };

    const handlePaymentModalClose = async () => {
        dispatch({ type: 'START_VERIFICATION' });
        try {
            const newPayment = await makePayment(outstandingBalance);
            dispatch({ type: 'VERIFICATION_SUCCESS', payload: newPayment });
        } catch (failedPayment) {
            dispatch({ type: 'VERIFICATION_FAILURE', payload: failedPayment as Payment });
        }
    };
    
    const handleCloseAllModals = () => {
        dispatch({ type: 'CLOSE_ALL_MODALS' });
    };

    const handleRetryPayment = async () => {
        dispatch({ type: 'RETRY_PAYMENT' });
        try {
            const newPayment = await makePayment(outstandingBalance);
            dispatch({ type: 'VERIFICATION_SUCCESS', payload: newPayment });
        } catch (failedPayment) {
            dispatch({ type: 'VERIFICATION_FAILURE', payload: failedPayment as Payment });
        }
    };

    const handleViewReceiptDetails = (payment: Payment) => {
        dispatch({ type: 'OPEN_RECEIPT_DETAILS', payload: payment });
    };

    return (
        <div>
            {state.modal === 'payment' && <PaymentModal onClose={handlePaymentModalClose} amount={outstandingBalance} upiId="suryalaha@upi" payeeName="Green City Connect" t={t} />}
            {state.modal === 'receipt' && state.activePayment && <ReceiptModal onClose={handleCloseAllModals} payment={state.activePayment} t={t} />}
            {state.modal === 'failed' && <PaymentFailedModal onClose={handleCloseAllModals} onRetry={handleRetryPayment} t={t} />}
            {state.modal === 'details' && state.activePayment && <ReceiptDetailModal onClose={handleCloseAllModals} payment={state.activePayment} user={user} t={t} />}

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
                        disabled={state.isVerifying || outstandingBalance <= 0}
                        className="bg-primary dark:bg-dark-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark text-center font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
                    >
                         {state.isVerifying ? (
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
                <ul className="space-y-1">
                    {payments.map((p, index) => {
                        const isPaid = p.status === 'paid';
                        return (
                            <li key={p.id} className={`flex justify-between items-center p-3 rounded-md ${index % 2 === 0 ? 'bg-gray-50 dark:bg-slate-700/50' : ''}`}>
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                        {isPaid ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">
                                            ₹{p.amount.toFixed(2)}
                                            {!isPaid && <span className="text-xs text-red-500 ml-2 font-medium">({t('failed')})</span>}
                                        </p>
                                        <p className="text-sm text-gray-500">{t('paymentOn')} {new Date(p.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {isPaid && (
                                    <button onClick={() => handleViewReceiptDetails(p)} className="flex items-center space-x-1 text-sm text-primary dark:text-dark-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary-light rounded-md p-1" aria-label={`${t('downloadReceipt')} for ${p.id}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <span>{t('download')}</span>
                                    </button>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </Card>
        </div>
    );
};

export default PaymentScreen;