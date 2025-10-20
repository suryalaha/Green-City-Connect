import React, { useState, useReducer, useEffect } from 'react';
import Card from '../ui/Card';
import { Payment, User } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';
import jsPDF from 'jspdf';

// --- STATE MANAGEMENT (useReducer) ---

interface State {
  modal: 'none' | 'payment' | 'receipt' | 'failed' | 'details' | 'upload';
  isProcessing: boolean; // General loading state
  activePayment: Payment | null; 
}

type Action =
  | { type: 'OPEN_PAYMENT_MODAL' }
  | { type: 'INITIATE_PAYMENT'; payload: Payment }
  | { type: 'UPLOAD_SUCCESS' }
  | { type: 'PAYMENT_VERIFIED'; payload: Payment } // For old payments
  | { type: 'OPEN_RECEIPT_DETAILS'; payload: Payment }
  | { type: 'CLOSE_ALL_MODALS' };

const initialState: State = {
  modal: 'none',
  isProcessing: false,
  activePayment: null,
};

function paymentReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN_PAYMENT_MODAL':
      return { ...state, modal: 'payment' };
    case 'INITIATE_PAYMENT':
      return { ...state, modal: 'upload', activePayment: action.payload };
    case 'UPLOAD_SUCCESS':
      return { ...state, modal: 'none', isProcessing: false, activePayment: null };
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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
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

const UploadScreenshotModal: React.FC<{
  onClose: () => void;
  payment: Payment;
  t: (key: string) => string;
  uploadPaymentScreenshot: (paymentId: string, url: string) => Promise<void>;
  onSuccess: () => void;
}> = ({ onClose, payment, t, uploadPaymentScreenshot, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Url = reader.result as string;
            await uploadPaymentScreenshot(payment.id, base64Url);
            setIsUploading(false);
            alert(t('uploadSuccess'));
            onSuccess();
        };
        reader.onerror = () => {
            setIsUploading(false);
            alert('File reading failed.');
        };
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h2 className="text-xl font-bold mb-2">{t('uploadScreenshot')}</h2>
                <p className="text-sm text-gray-500 mb-4">{t('uploadScreenshotInfo')}</p>
                
                <input type="file" id="screenshot" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                
                {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 rounded-lg max-h-40 mx-auto" />}
                
                <button onClick={handleUpload} disabled={!file || isUploading} className="w-full mt-4 bg-primary text-white py-2 rounded-md disabled:bg-gray-400">
                    {isUploading ? t('uploading') : t('upload')}
                </button>
            </Card>
        </div>
    );
};


const ReceiptDetailModal: React.FC<{ onClose: () => void; payment: Payment; user: User | null; t: (key: any) => string; }> = ({ onClose, payment, user, t }) => {
    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Green City Connect', 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Transaction Receipt', 105, 30, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
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
        if (user?.householdId) addDetail(`${t('householdId')}:`, user.householdId);
        addDetail(`${t('amountPaid')}:`, `₹${payment.amount.toFixed(2)}`);
        addDetail(`${t('paymentMethod')}:`, t('upi'));
        addDetail(`${t('status')}:`, t(`status_${payment.status}`).toUpperCase());
        doc.line(20, yPos, 190, yPos);
        yPos += 15;
        doc.setFontSize(10);
        doc.text('Thank you for your payment!', 105, yPos, { align: 'center' });
        doc.save(`receipt-${payment.id}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
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
                    <div className="flex justify-between"><span>{t('status')}:</span> <span className="font-semibold text-green-600 dark:text-green-400 capitalize">{t(`status_${payment.status}`)}</span></div>
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

const PaymentStatusBadge: React.FC<{ status: Payment['status'], t: (key: string) => string }> = ({ status, t }) => {
    const statusStyles = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        verified: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>{t(`status_${status}`)}</span>
}


// --- MAIN COMPONENT ---

const PaymentScreen: React.FC = () => {
    const { t } = useTranslations();
    const { loggedInUser, outstandingBalance, payments, initiatePayment, uploadPaymentScreenshot } = useAppContext();
    const user = loggedInUser as User;
    
    const [state, dispatch] = useReducer(paymentReducer, initialState);
    const [autoRenewal, setAutoRenewal] = useState(true);
    const [customAmount, setCustomAmount] = useState('');
    const [amountError, setAmountError] = useState('');
    const [amountToPay, setAmountToPay] = useState(outstandingBalance);
    
    const userPayments = payments.filter(p => p.userId === user?.id);

    useEffect(() => {
        setAmountToPay(outstandingBalance);
        setCustomAmount('');
        setAmountError('');
    }, [outstandingBalance]);

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomAmount(value);
        const numericValue = parseFloat(value);
        if (value === '') { setAmountError(''); setAmountToPay(outstandingBalance); return; }
        if (isNaN(numericValue) || numericValue <= 0) setAmountError(t('errorInvalidAmount'));
        else if (numericValue > outstandingBalance) setAmountError(t('errorAmountTooHigh').replace('{balance}', outstandingBalance.toFixed(2)));
        else { setAmountError(''); setAmountToPay(numericValue); }
    };

    const handlePayNowClick = () => {
        if (amountError) return;
        if (amountToPay > 0) dispatch({ type: 'OPEN_PAYMENT_MODAL' });
    };

    const handlePaymentModalClose = async () => {
        const newPayment = await initiatePayment(amountToPay);
        dispatch({ type: 'INITIATE_PAYMENT', payload: newPayment });
    };
    
    const handleCloseAllModals = () => dispatch({ type: 'CLOSE_ALL_MODALS' });
    const handleViewReceiptDetails = (payment: Payment) => dispatch({ type: 'OPEN_RECEIPT_DETAILS', payload: payment });

    return (
        <div>
            {state.modal === 'payment' && <PaymentModal onClose={handlePaymentModalClose} amount={amountToPay} upiId="suryalaha@upi" payeeName="Green City Connect" t={t} />}
            {state.modal === 'upload' && state.activePayment && <UploadScreenshotModal onClose={handleCloseAllModals} payment={state.activePayment} t={t} uploadPaymentScreenshot={uploadPaymentScreenshot} onSuccess={() => dispatch({ type: 'UPLOAD_SUCCESS' })} />}
            {state.modal === 'details' && state.activePayment && <ReceiptDetailModal onClose={handleCloseAllModals} payment={state.activePayment} user={user} t={t} />}

            <h1 className="text-3xl font-bold mb-4">{t('payment')}</h1>
            <Card>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">{t('outstandingBalance')}</h2>
                        <p className={`text-3xl font-bold ${outstandingBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{outstandingBalance.toFixed(2)}</p>
                    </div>
                    <button onClick={handlePayNowClick} disabled={state.isProcessing || amountToPay <= 0 || !!amountError} className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[180px]">
                         {`${t('payNow')} ₹${amountToPay.toFixed(2)}`}
                    </button>
                </div>
                 {outstandingBalance > 0 && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <label htmlFor="custom-amount" className="block text-sm font-medium mb-1">{t('enterCustomAmount')}</label>
                        <input id="custom-amount" type="number" value={customAmount} onChange={handleCustomAmountChange} placeholder={`Max: ₹${outstandingBalance.toFixed(2)}`} className={`w-full sm:w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${amountError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary border-gray-300 dark:border-gray-600'}`} />
                        {amountError && <p className="text-red-500 text-xs mt-1">{amountError}</p>}
                    </div>
                )}
            </Card>

            <Card className="mt-6">
                <h2 className="text-xl font-semibold mb-4">{t('paymentHistory')}</h2>
                <ul className="space-y-1">
                    {userPayments.map((p, index) => (
                        <li key={p.id} className={`flex justify-between items-center p-3 rounded-md ${index % 2 === 0 ? 'bg-gray-50 dark:bg-slate-700/50' : ''}`}>
                            <div className="flex items-center space-x-4">
                                <div>
                                    <p className="font-semibold">₹{p.amount.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">{t('paymentOn')} {new Date(p.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <PaymentStatusBadge status={p.status} t={t} />
                                {p.status === 'verified' && (
                                    <button onClick={() => handleViewReceiptDetails(p)} className="flex items-center space-x-1 text-sm text-primary dark:text-dark-primary hover:underline" aria-label={`${t('downloadReceipt')} for ${p.id}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        <span>{t('download')}</span>
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
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
        </div>
    );
};

export default PaymentScreen;