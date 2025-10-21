import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import Card from '../ui/Card';
import { useTranslations } from '../../hooks/useTranslations';

// SVG Icon Components for password visibility toggle
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

const PasswordStrengthIndicator: React.FC<{
    strength: 'none' | 'weak' | 'medium' | 'strong';
    t: (key: string) => string;
}> = ({ strength, t }) => {
    if (strength === 'none') return null;

    const strengthLevels = {
        weak: { label: t('passwordStrengthWeak'), color: 'bg-red-500', width: 'w-1/3' },
        medium: { label: t('passwordStrengthMedium'), color: 'bg-amber-500', width: 'w-2/3' },
        strong: { label: t('passwordStrengthStrong'), color: 'bg-primary-500', width: 'w-full' },
    };

    const currentLevel = strengthLevels[strength];

    return (
        <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-medium">{t('passwordStrength')}:</p>
                <p className={`text-xs font-bold ${currentLevel.color.replace('bg-', 'text-')}`}>{currentLevel.label}</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${currentLevel.color} ${currentLevel.width} transition-all duration-300`}></div>
            </div>
        </div>
    );
};


const LoginScreen: React.FC = () => {
  const { login, signup, adminLogin, resetPassword } = useAppContext();
  const { t } = useTranslations();
  
  type ViewMode = 'login' | 'signup' | 'forgot_password' | 'reset_password';
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  const [isLoading, setIsLoading] = useState(false);
  
  // Login State
  const [isLoginModeAdmin, setIsLoginModeAdmin] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});

  // Sign Up State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'none' | 'weak' | 'medium' | 'strong'>('none');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Password Reset State
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordStrength, setNewPasswordStrength] = useState<'none' | 'weak' | 'medium' | 'strong'>('none');
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});


  const checkPasswordStrength = (password: string): 'none' | 'weak' | 'medium' | 'strong' => {
      if (!password) return 'none';
      let score = 0;
      if (password.length >= 8) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      if (score < 3) return 'weak';
      if (score <= 4) return 'medium';
      return 'strong';
  };

  const validateSignUp = (): boolean => {
      const errors: Record<string, string> = {};
      if (!firstName.trim()) errors.firstName = t('errorFirstNameRequired');
      if (!lastName.trim()) errors.lastName = t('errorLastNameRequired');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail)) errors.signUpEmail = t('errorInvalidEmail');
      if (!/^\+?[0-9]{10,12}$/.test(mobile.replace(/\s/g, ''))) errors.mobile = t('errorInvalidMobile');
      if (address.trim().length < 10) errors.address = t('errorAddressMinLength');
      const strength = checkPasswordStrength(signUpPassword);
      if (strength === 'weak' || strength === 'none') errors.signUpPassword = t('errorPasswordWeak');
      if (!isEmailVerified) errors.emailOtp = t('errorVerifyEmail');
      if (!isMobileVerified) errors.mobile = t('errorVerifyMobile');
      if (!termsAccepted) errors.terms = t('errorTermsRequired');
      setSignUpErrors(errors);
      const isValid = Object.keys(errors).length === 0;
      setIsFormValid(isValid);
      return isValid;
  };

  useEffect(() => {
    if (viewMode === 'signup') validateSignUp();
  }, [firstName, lastName, signUpEmail, mobile, address, signUpPassword, isEmailVerified, isMobileVerified, termsAccepted, viewMode]);


  const validateLogin = () => {
    const errors: { identifier?: string; password?: string } = {};
    if (isLoginModeAdmin) {
        if (!/^[0-9]{10,12}$/.test(loginIdentifier)) {
            errors.identifier = t('errorInvalidMobile');
        }
    } else {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier)) {
            errors.identifier = t('errorInvalidEmail');
        }
    }
    if (loginPassword.length < 6) {
        errors.password = t('errorPasswordLength');
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    setIsLoading(true);
    setLoginErrors({}); // Clear previous auth errors
    try {
        if (isLoginModeAdmin) {
            await adminLogin(loginIdentifier, loginPassword);
        } else {
            await login(loginIdentifier, loginPassword);
        }
    } catch (error) {
        const errorMessageKey = (error as Error).message;
        setLoginErrors({ general: t(errorMessageKey) || t('errorInvalidCredentials') });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendOtp = (type: 'email' | 'mobile') => {
    if (type === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail)) {
            setSignUpErrors(prev => ({ ...prev, signUpEmail: t('errorInvalidEmail')}));
            return;
        }
        setEmailOtpSent(true);
        alert(t('emailOtpSentAlert'));
    }
    if (type === 'mobile') {
        if (!/^\+?[0-9]{10,12}$/.test(mobile.replace(/\s/g, ''))) {
            setSignUpErrors(prev => ({ ...prev, mobile: t('errorInvalidMobile')}));
            return;
        }
        const MOCK_WHATSAPP_OTP = "123456";
        const phoneNumber = '91' + mobile.replace(/\s|[^0-9]/g, '').slice(-10);
        const message = t('whatsappOtpMessage').replace('{otp}', MOCK_WHATSAPP_OTP);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        setMobileOtpSent(true);
    }
  };

  const handleVerifyOtp = (type: 'email' | 'mobile') => {
      const MOCK_EMAIL_OTP = "2233";
      const MOCK_WHATSAPP_OTP = "123456";
      if (type === 'email' && emailOtp === MOCK_EMAIL_OTP) {
          setIsEmailVerified(true);
          alert(t('emailVerifiedSuccess'));
      } else if (type === 'mobile' && mobileOtp === MOCK_WHATSAPP_OTP) {
          setIsMobileVerified(true);
          alert(t('mobileVerifiedSuccess'));
      } else {
          alert(t('invalidOtp'));
      }
  }

  const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateSignUp()) return;
      setIsLoading(true);
      try {
          const newUser = await signup({ name: `${firstName} ${lastName}`, email: signUpEmail, password: signUpPassword, address });
          alert(`${t('signupSuccessAlert')}\n${t('yourHouseholdIdIs')} ${newUser.householdId}`);
      } catch (error) {
          setSignUpErrors(prev => ({ ...prev, signUpEmail: (error as Error).message }));
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleSignUpPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setSignUpPassword(newPassword);
      setPasswordStrength(checkPasswordStrength(newPassword));
  };
  
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setNewPassword(newPassword);
      setNewPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSendResetCode = (e: React.FormEvent) => {
      e.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
          setResetErrors({ email: t('errorInvalidEmail') });
          return;
      }
      setResetErrors({});
      // In a real app, you would call an API here.
      alert(t('resetCodeSent'));
      setViewMode('reset_password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      const MOCK_RESET_CODE = "987654";
      const errors: Record<string, string> = {};
      if (resetCode !== MOCK_RESET_CODE) errors.code = t('errorInvalidResetCode');
      if (newPassword !== confirmNewPassword) errors.confirmPassword = t('errorPasswordsDoNotMatch');
      const strength = checkPasswordStrength(newPassword);
      if (strength === 'weak' || strength === 'none') errors.newPassword = t('errorPasswordWeak');

      if (Object.keys(errors).length > 0) {
          setResetErrors(errors);
          return;
      }

      setResetErrors({});
      setIsLoading(true);
      try {
          await resetPassword(resetEmail, newPassword);
          alert(t('passwordResetSuccess'));
          setViewMode('login');
          // Clear reset fields
          setResetEmail('');
          setResetCode('');
          setNewPassword('');
          setConfirmNewPassword('');
      } catch (error) {
          const errorMessageKey = (error as Error).message;
          setResetErrors({ email: t(errorMessageKey) || t('errorEmailNotFound') });
      } finally {
          setIsLoading(false);
      }
  };
  
  const getSignUpInputClass = (fieldName: string) => `w-full p-3 border rounded-lg bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${signUpErrors[fieldName] ? 'border-danger focus:ring-danger/50' : 'focus:ring-primary/50 border-slate-200 dark:border-slate-700 focus:border-primary'}`;
  
  const clearState = () => {
    setLoginIdentifier('');
    setLoginPassword('');
    setLoginErrors({});
    setResetEmail('');
    setResetErrors({});
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'login':
        return (
          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {loginErrors.general && <p className="text-danger text-sm text-center -mt-2 mb-2">{loginErrors.general}</p>}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="identifier">{isLoginModeAdmin ? t('mobileNumber') : t('email')}</label>
              <input
                id="identifier"
                type={isLoginModeAdmin ? 'tel' : 'email'}
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 ${loginErrors.identifier || loginErrors.general ? 'border-danger focus:ring-danger/50' : 'focus:ring-primary/50 border-slate-200 dark:border-slate-700 focus:border-primary'}`}
                placeholder={isLoginModeAdmin ? '9064201746' : 'you@example.com'}
                required
                aria-invalid={!!loginErrors.identifier}
                aria-describedby="identifier-error"
              />
              {loginErrors.identifier && <p id="identifier-error" className="text-danger text-xs mt-1">{loginErrors.identifier}</p>}
            </div>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium" htmlFor="password">{t('password')}</label>
                    <button type="button" onClick={() => setViewMode('forgot_password')} className="text-sm font-medium text-primary dark:text-primary-400 hover:underline">{t('forgotPassword')}</button>
                </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 ${loginErrors.password || loginErrors.general ? 'border-danger focus:ring-danger/50' : 'focus:ring-primary/50 border-slate-200 dark:border-slate-700 focus:border-primary'}`}
                  placeholder="••••••••"
                  required
                  aria-invalid={!!loginErrors.password}
                  aria-describedby="password-error"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
               {loginErrors.password && <p id="password-error" className="text-danger text-xs mt-1">{loginErrors.password}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transform transition-all active:scale-95 disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? t('loggingIn') : t('login')}
            </button>
          </form>
        );
      case 'signup':
        return (
          <form onSubmit={handleSignUp} noValidate className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">{t('firstName')}</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={getSignUpInputClass('firstName')} required />
                    {signUpErrors.firstName && <p className="text-danger text-xs mt-1">{signUpErrors.firstName}</p>}
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">{t('lastName')}</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={getSignUpInputClass('lastName')} required />
                    {signUpErrors.lastName && <p className="text-danger text-xs mt-1">{signUpErrors.lastName}</p>}
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('email')}</label>
              <div className="flex">
                  <input type="email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} className={`${getSignUpInputClass('signUpEmail')} rounded-r-none`} required disabled={emailOtpSent}/>
                  <button type="button" onClick={() => handleSendOtp('email')} disabled={emailOtpSent} className="px-4 py-2 bg-secondary text-white rounded-r-lg text-sm disabled:bg-gray-400 transition-colors hover:bg-secondary-700">{emailOtpSent ? t('sent') : t('sendOtp')}</button>
              </div>
               {signUpErrors.signUpEmail && <p className="text-danger text-xs mt-1">{signUpErrors.signUpEmail}</p>}
            </div>
            {emailOtpSent && !isEmailVerified && (
              <div>
                  <label className="block text-sm font-medium mb-1">{t('emailOtp')}</label>
                   <div className="flex">
                      <input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} className="w-full p-3 border rounded-l-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700" maxLength={6} />
                      <button type="button" onClick={() => handleVerifyOtp('email')} className="px-4 py-2 bg-secondary text-white rounded-r-lg text-sm transition-colors hover:bg-secondary-700">{t('verify')}</button>
                  </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">{t('mobileNumber')}</label>
               <div className="flex">
                  <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="9876543210" className={`${getSignUpInputClass('mobile')} rounded-r-none`} required disabled={mobileOtpSent}/>
                  <button type="button" onClick={() => handleSendOtp('mobile')} disabled={mobileOtpSent} className="px-4 py-2 bg-secondary text-white rounded-r-lg text-sm disabled:bg-gray-400 transition-colors hover:bg-secondary-700">{mobileOtpSent ? t('sent') : t('sendWhatsAppOtp')}</button>
              </div>
               {signUpErrors.mobile && <p className="text-danger text-xs mt-1">{signUpErrors.mobile}</p>}
            </div>
             {mobileOtpSent && !isMobileVerified && (
              <div>
                  <label className="block text-sm font-medium mb-1">{t('whatsAppOtp')}</label>
                   <div className="flex">
                      <input type="text" value={mobileOtp} onChange={e => setMobileOtp(e.target.value)} className="w-full p-3 border rounded-l-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700" maxLength={6}/>
                      <button type="button" onClick={() => handleVerifyOtp('mobile')} className="px-4 py-2 bg-secondary text-white rounded-r-lg text-sm transition-colors hover:bg-secondary-700">{t('verify')}</button>
                  </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">{t('address')}</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className={getSignUpInputClass('address')} required placeholder={t('addressPlaceholder')} />
               {signUpErrors.address && <p className="text-danger text-xs mt-1">{signUpErrors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="signUpPassword">{t('password')}</label>
              <input id="signUpPassword" type="password" value={signUpPassword} onChange={handleSignUpPasswordChange} className={getSignUpInputClass('signUpPassword')} required />
               {signUpErrors.signUpPassword && <p className="text-danger text-xs mt-1">{signUpErrors.signUpPassword}</p>}
              <PasswordStrengthIndicator strength={passwordStrength} t={t} />
            </div>
            <div>
              <div className="flex items-start">
                <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5 dark:bg-slate-700 dark:border-slate-600 dark:checked:bg-primary" />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('termsAgreement')}{' '}<a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-primary dark:text-primary-400 hover:underline">{t('termsLink')}</a></label>
              </div>
              {signUpErrors.terms && <p id="terms-error" className="text-danger text-xs mt-1 ml-6">{signUpErrors.terms}</p>}
            </div>
            <button type="submit" disabled={!isFormValid || isLoading} className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transform transition-all active:scale-95 disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? t('signingUp') : t('signUp')}
            </button>
          </form>
        );
      case 'forgot_password':
        return (
          <form onSubmit={handleSendResetCode} noValidate className="space-y-4">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 -mt-4">{t('enterResetEmailPrompt')}</p>
            {resetErrors.email && <p className="text-danger text-sm text-center">{resetErrors.email}</p>}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="reset-email">{t('email')}</label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 ${resetErrors.email ? 'border-danger focus:ring-danger/50' : 'focus:ring-primary/50 border-slate-200 dark:border-slate-700 focus:border-primary'}`}
                placeholder="you@example.com"
                required
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg">
              {t('sendResetCode')}
            </button>
          </form>
        );
      case 'reset_password':
        return (
          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 -mt-4">{t('enterResetCodePrompt')}</p>
            {resetErrors.general && <p className="text-danger text-sm text-center">{resetErrors.general}</p>}
             <div>
                <label className="block text-sm font-medium mb-1">{t('resetCode')}</label>
                <input type="text" value={resetCode} onChange={e => setResetCode(e.target.value)} className={`w-full p-3 border rounded-lg dark:bg-slate-800 ${resetErrors.code ? 'border-danger' : 'border-slate-200 dark:border-slate-700'}`} maxLength={6} required />
                {resetErrors.code && <p className="text-danger text-xs mt-1">{resetErrors.code}</p>}
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">{t('newPassword')}</label>
                <input type="password" value={newPassword} onChange={handleNewPasswordChange} className={`w-full p-3 border rounded-lg dark:bg-slate-800 ${resetErrors.newPassword ? 'border-danger' : 'border-slate-200 dark:border-slate-700'}`} required />
                {resetErrors.newPassword && <p className="text-danger text-xs mt-1">{resetErrors.newPassword}</p>}
                <PasswordStrengthIndicator strength={newPasswordStrength} t={t} />
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">{t('confirmNewPassword')}</label>
                <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className={`w-full p-3 border rounded-lg dark:bg-slate-800 ${resetErrors.confirmPassword ? 'border-danger' : 'border-slate-200 dark:border-slate-700'}`} required />
                {resetErrors.confirmPassword && <p className="text-danger text-xs mt-1">{resetErrors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg disabled:opacity-70">
              {isLoading ? t('resettingPassword') : t('resetPassword')}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch(viewMode) {
      case 'login': return 'Welcome! Please log in.';
      case 'signup': return 'Create an account to get started.';
      case 'forgot_password':
      case 'reset_password': return t('resetPassword');
      default: return '';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-100 via-white to-secondary-100 dark:from-primary-900/20 dark:via-dark-background dark:to-secondary-900/20 p-4">
      <Card className="w-full max-w-md hover:-translate-y-0">
        <h1 className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">Green City Connect</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{getTitle()}</p>
        
        {viewMode === 'login' && (
            <div className="flex justify-center mb-6">
                <div className="relative flex p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <button onClick={() => { setIsLoginModeAdmin(false); clearState(); }} className={`relative z-10 w-24 py-1.5 rounded-full text-sm font-semibold transition-colors ${!isLoginModeAdmin ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{t('user')}</button>
                    <button onClick={() => { setIsLoginModeAdmin(true); clearState(); }} className={`relative z-10 w-24 py-1.5 rounded-full text-sm font-semibold transition-colors ${isLoginModeAdmin ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{t('admin')}</button>
                    <span className={`absolute top-1 left-1 h-8 w-24 rounded-full bg-gradient-to-r from-primary to-secondary shadow-md transform transition-transform ${isLoginModeAdmin ? 'translate-x-full' : ''}`}></span>
                </div>
            </div>
        )}
        
        {renderContent()}

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {viewMode === 'login' && (
                <>
                    {t('noAccount')}
                    <button onClick={() => { setViewMode('signup'); clearState(); }} className="font-semibold text-primary dark:text-primary-400 hover:underline ml-1">
                        {t('signUp')}
                    </button>
                </>
            )}
            {viewMode === 'signup' && (
                <>
                    {t('hasAccount')}
                     <button onClick={() => { setViewMode('login'); clearState(); }} className="font-semibold text-primary dark:text-primary-400 hover:underline ml-1">
                        {t('login')}
                    </button>
                </>
            )}
            {(viewMode === 'forgot_password' || viewMode === 'reset_password') && (
                 <button onClick={() => { setViewMode('login'); clearState(); }} className="font-semibold text-primary dark:text-primary-400 hover:underline">
                    {t('backToLogin')}
                </button>
            )}
        </div>
      </Card>
    </div>
  );
};

export default LoginScreen;