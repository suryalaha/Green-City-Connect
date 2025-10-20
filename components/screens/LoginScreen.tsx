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
        medium: { label: t('passwordStrengthMedium'), color: 'bg-yellow-500', width: 'w-2/3' },
        strong: { label: t('passwordStrengthStrong'), color: 'bg-green-500', width: 'w-full' },
    };

    const currentLevel = strengthLevels[strength];

    return (
        <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-medium">{t('passwordStrength')}:</p>
                <p className={`text-xs font-bold ${currentLevel.color.replace('bg-', 'text-')}`}>{currentLevel.label}</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${currentLevel.color} ${currentLevel.width} transition-all duration-300`}></div>
            </div>
        </div>
    );
};


const LoginScreen: React.FC = () => {
  const { login } = useAppContext();
  const { t } = useTranslations();
  
  const [isLoginView, setIsLoginView] = useState(true);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmailError, setLoginEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');

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
      if (!/^\+91[7-9][0-9]{9}$/.test(mobile)) errors.mobile = t('errorInvalidMobile');
      if (address.trim().length < 10) errors.address = t('errorAddressMinLength');
      
      const strength = checkPasswordStrength(signUpPassword);
      if (strength === 'weak' || strength === 'none') {
        errors.signUpPassword = t('errorPasswordWeak');
      }

      if (!isEmailVerified) errors.emailOtp = t('errorVerifyEmail');
      if (!isMobileVerified) errors.mobileOtp = t('errorVerifyMobile');
      if (!termsAccepted) errors.terms = t('errorTermsRequired');

      setSignUpErrors(errors);
      const isValid = Object.keys(errors).length === 0;
      setIsFormValid(isValid);
      return isValid;
  };

  useEffect(() => {
    // Re-validate form whenever a sign-up field changes
    if (!isLoginView) {
        validateSignUp();
    }
  }, [firstName, lastName, signUpEmail, mobile, address, signUpPassword, isEmailVerified, isMobileVerified, termsAccepted, isLoginView]);


  const validateLogin = () => {
    let isValid = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setLoginEmailError(t('errorInvalidEmail'));
      isValid = false;
    } else {
      setLoginEmailError('');
    }

    if (loginPassword.length < 8) {
      setLoginPasswordError(t('errorPasswordLength'));
      isValid = false;
    } else {
      setLoginPasswordError('');
    }
    return isValid;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    
    const sampleUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      address: '123 Green St, Eco City, 12345',
      householdId: 'GCC-JD-A4B8',
    };
    login(sampleUser);
  };

  const handleSendOtp = (type: 'email' | 'mobile') => {
    if (type === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail)) {
            setSignUpErrors(prev => ({ ...prev, signUpEmail: t('errorInvalidEmail')}));
            return;
        }
        setEmailOtpSent(true);
        alert(`${t('otpSentAlert')} (123456)`);
    }
    if (type === 'mobile') {
        if (!/^\+91[7-9][0-9]{9}$/.test(mobile)) {
            setSignUpErrors(prev => ({ ...prev, mobile: t('errorInvalidMobile')}));
            return;
        }
        setMobileOtpSent(true);
        alert(`${t('otpSentAlert')} (123456)`);
    }
  };

  const handleVerifyOtp = (type: 'email' | 'mobile') => {
      const MOCK_OTP = "123456";
      if (type === 'email') {
          if(emailOtp === MOCK_OTP) {
              setIsEmailVerified(true);
              alert(t('emailVerifiedSuccess'));
          } else {
              alert(t('invalidOtp'));
          }
      }
      if (type === 'mobile') {
          if(mobileOtp === MOCK_OTP) {
              setIsMobileVerified(true);
              alert(t('mobileVerifiedSuccess'));
          } else {
              alert(t('invalidOtp'));
          }
      }
  }
  
  const generateHouseholdId = (firstName: string, lastName: string, address: string): string => {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        const char = address.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    const shortHash = Math.abs(hash).toString(16).slice(0, 4).toUpperCase();
    return `GCC-${initials}-${shortHash}`;
  };

  const handleSignUp = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateSignUp()) {
          return;
      }

      const householdId = generateHouseholdId(firstName, lastName, address);
      const newUser: User = {
          id: Date.now().toString(),
          name: `${firstName} ${lastName}`,
          email: signUpEmail,
          address,
          householdId,
      };
      alert(`${t('signupSuccessAlert')}\n${t('yourHouseholdIdIs')} ${householdId}`);
      login(newUser);
  };
  
  const handleSignUpPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setSignUpPassword(newPassword);
      setPasswordStrength(checkPasswordStrength(newPassword));
  };
  
  const getInputClass = (fieldName: string) => {
    return `w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${signUpErrors[fieldName] ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary border-gray-300 dark:border-gray-600'}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary dark:text-dark-primary">
          Green City Connect
        </h1>
        {isLoginView ? (
          <form onSubmit={handleLogin} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">{t('email')}</label>
              <input
                id="email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${loginEmailError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary border-gray-300 dark:border-gray-600'}`}
                placeholder="you@example.com"
                required
                aria-invalid={!!loginEmailError}
                aria-describedby="email-error"
              />
              {loginEmailError && <p id="email-error" className="text-red-500 text-xs mt-1">{loginEmailError}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="password">{t('password')}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${loginPasswordError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary border-gray-300 dark:border-gray-600'}`}
                  placeholder="••••••••"
                  required
                  aria-invalid={!!loginPasswordError}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {loginPasswordError && <p id="password-error" className="text-red-500 text-xs mt-1">{loginPasswordError}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              {t('login')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} noValidate className="space-y-4">
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">{t('firstName')}</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={getInputClass('firstName')} required />
                    {signUpErrors.firstName && <p className="text-red-500 text-xs mt-1">{signUpErrors.firstName}</p>}
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">{t('lastName')}</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={getInputClass('lastName')} required />
                    {signUpErrors.lastName && <p className="text-red-500 text-xs mt-1">{signUpErrors.lastName}</p>}
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('email')}</label>
              <div className="flex">
                  <input type="email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} className={`${getInputClass('signUpEmail')} rounded-r-none`} required disabled={emailOtpSent}/>
                  <button type="button" onClick={() => handleSendOtp('email')} disabled={emailOtpSent} className="px-4 py-2 bg-secondary text-white rounded-r-md text-sm disabled:bg-gray-400">{emailOtpSent ? t('sent') : t('sendOtp')}</button>
              </div>
               {signUpErrors.signUpEmail && <p className="text-red-500 text-xs mt-1">{signUpErrors.signUpEmail}</p>}
            </div>
            {emailOtpSent && !isEmailVerified && (
              <div>
                  <label className="block text-sm font-medium mb-1">{t('emailOtp')}</label>
                   <div className="flex">
                      <input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} className="w-full p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600" maxLength={6} />
                      <button type="button" onClick={() => handleVerifyOtp('email')} className="px-4 py-2 bg-secondary text-white rounded-r-md text-sm">{t('verify')}</button>
                  </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('mobileNumber')}</label>
               <div className="flex">
                  <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91" className={`${getInputClass('mobile')} rounded-r-none`} required disabled={mobileOtpSent}/>
                  <button type="button" onClick={() => handleSendOtp('mobile')} disabled={mobileOtpSent} className="px-4 py-2 bg-secondary text-white rounded-r-md text-sm disabled:bg-gray-400">{mobileOtpSent ? t('sent') : t('sendOtp')}</button>
              </div>
               {signUpErrors.mobile && <p className="text-red-500 text-xs mt-1">{signUpErrors.mobile}</p>}
            </div>
             {mobileOtpSent && !isMobileVerified && (
              <div>
                  <label className="block text-sm font-medium mb-1">{t('mobileOtp')}</label>
                   <div className="flex">
                      <input type="text" value={mobileOtp} onChange={e => setMobileOtp(e.target.value)} className="w-full p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600" maxLength={6}/>
                      <button type="button" onClick={() => handleVerifyOtp('mobile')} className="px-4 py-2 bg-secondary text-white rounded-r-md text-sm">{t('verify')}</button>
                  </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">{t('address')}</label>
              <textarea 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                rows={2} 
                className={getInputClass('address')} 
                required 
                placeholder={t('addressPlaceholder')}
              />
               {signUpErrors.address && <p className="text-red-500 text-xs mt-1">{signUpErrors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="signUpPassword">{t('password')}</label>
              <input 
                id="signUpPassword"
                type="password" 
                value={signUpPassword} 
                onChange={handleSignUpPasswordChange} 
                className={getInputClass('signUpPassword')}
                required 
              />
               {signUpErrors.signUpPassword && <p className="text-red-500 text-xs mt-1">{signUpErrors.signUpPassword}</p>}
              <PasswordStrengthIndicator strength={passwordStrength} t={t} />
            </div>
            
            <div>
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-0.5 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-dark-primary"
                  aria-describedby="terms-error"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('termsAgreement')}{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-primary dark:text-dark-primary hover:underline">
                    {t('termsLink')}
                  </a>
                </label>
              </div>
              {signUpErrors.terms && <p id="terms-error" className="text-red-500 text-xs mt-1 ml-6">{signUpErrors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400"
            >
              {t('signUp')}
            </button>
          </form>
        )}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLoginView ? t('noAccount') : t('hasAccount')}
            <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-primary dark:text-dark-primary hover:underline ml-1">
                {isLoginView ? t('signUp') : t('login')}
            </button>
        </div>
      </Card>
    </div>
  );
};

export default LoginScreen;