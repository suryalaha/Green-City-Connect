import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';
import { useAppContext } from '../../context/AppContext';
import { User, AdminMessage, Payment, Booking, Complaint } from '../../types';
import Modal from '../ui/Modal';

type AdminTab = 'overview' | 'users' | 'payments' | 'bookings' | 'complaints' | 'messaging';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {label}
  </button>
);

const StatusBadge: React.FC<{ status: string, type: 'user' | 'payment' | 'booking' | 'complaint' }> = ({ status, type }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    const statusMap: Record<string, string> = {
        // User
        active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        restricted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        blocked: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        // Payment
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        verified: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        // Booking
        scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
        // Complaint
        submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        resolved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    };
    return <span className={`${baseClasses} ${statusMap[status] || ''}`}>{status}</span>
};

// --- TABS ---

const OverviewTab: React.FC = () => {
    const { t } = useTranslations();
    const { users, payments, bookings, complaints } = useAppContext();
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const openComplaints = complaints.filter(c => c.status !== 'resolved').length;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center"><div className="text-4xl">👥</div><p className="text-2xl font-bold">{users.length}</p><h3 className="text-gray-500">{t('totalUsers')}</h3></Card>
            <Card className="text-center"><div className="text-4xl">💰</div><p className="text-2xl font-bold">{pendingPayments}</p><h3 className="text-gray-500">{t('pendingPayments')}</h3></Card>
            <Card className="text-center"><div className="text-4xl">📅</div><p className="text-2xl font-bold">{bookings.length}</p><h3 className="text-gray-500">{t('totalBookings')}</h3></Card>
            <Card className="text-center"><div className="text-4xl">⚠️</div><p className="text-2xl font-bold">{openComplaints}</p><h3 className="text-gray-500">{t('openComplaints')}</h3></Card>
        </div>
    );
};

const UserManagementTab: React.FC = () => {
    const { t } = useTranslations();
    const { users, updateUserStatus, deleteUser } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            {selectedUser && (
                <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={t('userDetails')}>
                    <div className="space-y-4">
                        <p><strong>{t('name')}:</strong> {selectedUser.name}</p>
                        <p><strong>{t('email')}:</strong> {selectedUser.email}</p>
                        <p><strong>{t('password')}:</strong> ••••••••</p>
                        <p><strong>{t('address')}:</strong> {selectedUser.address}</p>
                        <p><strong>{t('householdId')}:</strong> {selectedUser.householdId}</p>
                        <div>
                            <strong>{t('status')}: </strong>
                            <select value={selectedUser.status} onChange={(e) => updateUserStatus(selectedUser.id, e.target.value as User['status'])} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="active">{t('status_active')}</option>
                                <option value="restricted">{t('status_restricted')}</option>
                                <option value="blocked">{t('status_blocked')}</option>
                            </select>
                        </div>
                        <button onClick={() => deleteUser(selectedUser.id)} className="w-full bg-danger text-white py-2 rounded-md">{t('delete')}</button>
                    </div>
                </Modal>
            )}
            <h2 className="text-2xl font-semibold mb-4">{t('userManagement')}</h2>
            <input type="text" placeholder={t('searchUsers')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 mb-4" />
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b dark:border-gray-700"><th className="p-2">{t('name')}</th><th className="p-2">{t('email')}</th><th className="p-2">{t('status')}</th><th className="p-2">{t('actions')}</th></tr></thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-2">{user.name}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2"><StatusBadge status={user.status} type="user" /></td>
                                <td className="p-2"><button onClick={() => setSelectedUser(user)} className="text-primary hover:underline text-sm">{t('view')}</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const PaymentVerificationTab: React.FC = () => {
    const { t } = useTranslations();
    const { payments, users, updatePaymentStatus } = useAppContext();
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');
    const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

    const paymentsWithUsers = useMemo(() => payments.map(p => ({...p, user: users.find(u => u.id === p.userId)})).filter(p => p.user), [payments, users]);
    const filteredPayments = filter === 'pending' ? paymentsWithUsers.filter(p => p.status === 'pending') : paymentsWithUsers;
    
    return (
        <Card>
            {viewingScreenshot && (
                <Modal isOpen={!!viewingScreenshot} onClose={() => setViewingScreenshot(null)} title="Payment Screenshot">
                    <img src={viewingScreenshot} alt="Payment Screenshot" className="max-w-full max-h-[70vh] mx-auto"/>
                </Modal>
            )}
            <h2 className="text-2xl font-semibold mb-4">{t('paymentVerification')}</h2>
             <div className="flex space-x-2 mb-4">
                <TabButton label={t('pending')} isActive={filter === 'pending'} onClick={() => setFilter('pending')} />
                <TabButton label={t('all')} isActive={filter === 'all'} onClick={() => setFilter('all')} />
            </div>
            <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead><tr className="border-b dark:border-gray-700"><th className="p-2">User</th><th className="p-2">Amount</th><th className="p-2">Date</th><th className="p-2">Status</th><th className="p-2">Screenshot</th><th className="p-2">Actions</th></tr></thead>
                    <tbody>
                        {filteredPayments.map(p => (
                            <tr key={p.id} className="border-b dark:border-gray-700">
                                <td className="p-2">{p.user?.name || 'N/A'}</td>
                                <td className="p-2">₹{p.amount.toFixed(2)}</td>
                                <td className="p-2">{new Date(p.date).toLocaleDateString()}</td>
                                <td className="p-2"><StatusBadge status={p.status} type="payment" /></td>
                                <td className="p-2">
                                    {p.screenshotUrl ? <button onClick={() => setViewingScreenshot(p.screenshotUrl!)} className="text-primary hover:underline text-sm">{t('viewScreenshot')}</button> : <span className="text-xs text-gray-500">{t('noScreenshot')}</span>}
                                </td>
                                <td className="p-2">
                                    {p.status === 'pending' && (
                                        <div className="flex space-x-2">
                                            <button onClick={() => updatePaymentStatus(p.id, 'verified')} className="text-green-600 hover:underline text-sm">{t('approve')}</button>
                                            <button onClick={() => updatePaymentStatus(p.id, 'rejected')} className="text-red-600 hover:underline text-sm">{t('reject')}</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const BookingsManagementTab: React.FC = () => {
    const { t } = useTranslations();
    const { bookings, users, updateBooking } = useAppContext();
    const bookingsWithUsers = useMemo(() => bookings.map(b => ({ ...b, user: users.find(u => u.id === b.userId) })).filter(b => b.user), [bookings, users]);

    return (
        <Card>
            <h2 className="text-2xl font-semibold mb-4">{t('bookingsManagement')}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b dark:border-gray-700"><th className="p-2">User</th><th className="p-2">Date</th><th className="p-2">Notes</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
                    <tbody>
                        {bookingsWithUsers.map(b => (
                            <tr key={b.id} className="border-b dark:border-gray-700">
                                <td className="p-2">{b.user?.name}</td>
                                <td className="p-2">{new Date(b.date).toLocaleDateString()} {b.time}</td>
                                <td className="p-2 truncate max-w-xs">{b.notes}</td>
                                <td className="p-2"><StatusBadge status={b.status} type="booking" /></td>
                                <td className="p-2">
                                    <select value={b.status} onChange={e => updateBooking(b.id, { status: e.target.value as Booking['status'] })} className="text-sm p-1 border rounded dark:bg-gray-700">
                                        <option value="scheduled">{t('statusScheduled')}</option>
                                        <option value="completed">{t('statusCompleted')}</option>
                                        <option value="cancelled">{t('statusCancelled')}</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

const ComplaintsManagementTab: React.FC = () => {
    const { t } = useTranslations();
    const { complaints, users, updateComplaint } = useAppContext();
    const [viewingComplaintPhoto, setViewingComplaintPhoto] = useState<string | null>(null);

    const complaintsWithUsers = useMemo(() => complaints.map(c => ({ ...c, user: users.find(u => u.id === c.userId) })).filter(c => c.user), [complaints, users]);
    
    return (
        <Card>
            {viewingComplaintPhoto && (
                <Modal isOpen={!!viewingComplaintPhoto} onClose={() => setViewingComplaintPhoto(null)} title={t('complaintEvidence')}>
                    <img src={viewingComplaintPhoto} alt="Complaint Evidence" className="max-w-full max-h-[70vh] mx-auto rounded-lg"/>
                </Modal>
            )}
            <h2 className="text-2xl font-semibold mb-4">{t('complaintsManagement')}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                     <thead><tr className="border-b dark:border-gray-700"><th className="p-2">{t('user')}</th><th className="p-2">{t('issueType')}</th><th className="p-2">{t('description')}</th><th className="p-2">{t('photo')}</th><th className="p-2">{t('status')}</th><th className="p-2">{t('actions')}</th></tr></thead>
                    <tbody>
                         {complaintsWithUsers.map(c => (
                            <tr key={c.id} className="border-b dark:border-gray-700">
                                <td className="p-2">{c.user?.name}</td>
                                <td className="p-2">{t(c.issueType)}</td>
                                <td className="p-2 truncate max-w-xs">{c.description}</td>
                                <td className="p-2">
                                    {c.photo ? (
                                        <button onClick={() => setViewingComplaintPhoto(c.photo!)} className="text-primary hover:underline text-sm font-semibold">
                                            {t('view')}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-500">{t('notApplicable')}</span>
                                    )}
                                </td>
                                <td className="p-2"><StatusBadge status={c.status} type="complaint" /></td>
                                <td className="p-2">
                                    <select value={c.status} onChange={e => updateComplaint(c.id, { status: e.target.value as Complaint['status'] })} className="text-sm p-1 border rounded dark:bg-gray-700">
                                        <option value="submitted">{t('statusSubmitted')}</option>
                                        <option value="in-progress">{t('statusInProgress')}</option>
                                        <option value="resolved">{t('statusResolved')}</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const CommunityMessagingTab: React.FC = () => {
    const { t } = useTranslations();
    const { createAnnouncement } = useAppContext();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handlePost = () => {
        if (title.trim() && content.trim()) {
            createAnnouncement(title, content);
            setTitle('');
            setContent('');
            alert('Community message sent!');
        } else {
            alert('Please provide a title and content.');
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-semibold mb-2">{t('communityMessaging')}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('communityMessagingInfo')}</p>
            <div className="space-y-4">
                <input type="text" placeholder={t('announcementTitle')} value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                <textarea placeholder={t('announcementContent')} value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                <button onClick={handlePost} className="w-full bg-primary text-white py-2 rounded-md">{t('sendMessage')}</button>
            </div>
        </Card>
    );
};


// --- MAIN COMPONENT ---

const AdminDashboardScreen: React.FC = () => {
    const { t } = useTranslations();
    const { loggedInUser, logout } = useAppContext();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab />;
            case 'users': return <UserManagementTab />;
            case 'payments': return <PaymentVerificationTab />;
            case 'bookings': return <BookingsManagementTab />;
            case 'complaints': return <ComplaintsManagementTab />;
            case 'messaging': return <CommunityMessagingTab />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold">{t('adminDashboard')}</h1>
                    <p className="text-lg mt-1 text-gray-500">{t('welcome')}, {loggedInUser?.name}!</p>
                </div>
                <button onClick={logout} className="bg-danger text-white px-4 py-2 rounded-md hover:bg-danger-dark transition-colors">{t('logout')}</button>
            </div>

            <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <TabButton label={t('overview')} isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <TabButton label={t('users')} isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <TabButton label={t('payments')} isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                <TabButton label={t('bookings')} isActive={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                <TabButton label={t('complaints')} isActive={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} />
                <TabButton label={t('messaging')} isActive={activeTab === 'messaging'} onClick={() => setActiveTab('messaging')} />
            </div>

            <div>{renderTabContent()}</div>
        </div>
    );
};

export default AdminDashboardScreen;