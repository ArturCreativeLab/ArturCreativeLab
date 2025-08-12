import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from '../context/LanguageContext';

type AuthMode = 'login' | 'signup';

const FormFeedback: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => {
  if (!message) return null;
  const baseClasses = 'p-3 rounded-md text-sm my-4 text-center';
  const typeClasses = type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200';
  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
}

export const LoginScreen: React.FC = () => {
    const { loginWithGoogle, loginAsGuest, signUpWithEmail, signInWithEmail } = useAuth();
    const { t, language, setLanguage } = useTranslations();
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleEmailPasswordAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setFeedback(null);
      
      let result;
      if (authMode === 'signup') {
        result = await signUpWithEmail(name, email, password);
      } else {
        result = await signInWithEmail(email, password);
      }
      
      const message = t.login.feedback[result.messageKey] || result.messageKey;

      if (result.success) {
        setFeedback({ message, type: 'success' });
        if (authMode === 'signup') {
            setName('');
            setEmail('');
            setPassword('');
        }
      } else {
        setFeedback({ message, type: 'error' });
      }
      setLoading(false);
    };

    const toggleMode = (mode: AuthMode) => {
        setAuthMode(mode);
        setFeedback(null);
        setEmail('');
        setPassword('');
        setName('');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
            <div className="relative text-center bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-gray-400/10 w-full max-w-md mx-4 border border-gray-200">
                 <button
                    onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                    className="absolute top-4 right-4 text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-md w-10 h-8 flex items-center justify-center"
                >
                    {language.toUpperCase()}
                </button>
                 <div className="flex items-center justify-center mb-6">
                    <img src="https://i.postimg.cc/HnDzGfhs/isotipo-color.png" alt="Artur Creative Group Isotype" className="w-20 h-20 object-contain" />
                 </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.login.title}</h1>
                <p className="text-gray-600 mb-6">
                    {t.login.description}
                </p>

                {/* TABS */}
                <div className="flex w-full bg-gray-100 rounded-lg p-1 border border-gray-200 mb-6">
                    <button onClick={() => toggleMode('login')} className={`w-full rounded-md py-2 text-sm font-medium transition-colors focus:outline-none ${authMode === 'login' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                        {t.login.sign_in_tab}
                    </button>
                    <button onClick={() => toggleMode('signup')} className={`w-full rounded-md py-2 text-sm font-medium transition-colors focus:outline-none ${authMode === 'signup' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                        {t.login.sign_up_tab}
                    </button>
                </div>
                
                <form onSubmit={handleEmailPasswordAuth} className="space-y-4 text-left">
                    {authMode === 'signup' && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t.login.name_label}</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t.login.email_label}</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                     <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">{t.login.password_label}</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>

                    <FormFeedback message={feedback?.message || ''} type={feedback?.type || 'success'} />

                    <button type="submit" disabled={loading} className="w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:bg-gray-400">
                      {loading ? t.login.processing_button : (authMode === 'login' ? t.login.sign_in_button : t.login.create_account_button)}
                    </button>
                </form>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">{t.login.or_separator}</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="space-y-3">
                  <button onClick={loginWithGoogle} className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center justify-center">
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.655-3.654-11.129-8.481l-6.571 4.819C9.656 39.663 16.318 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.591 34.931 48 29.825 48 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                      {t.login.google_button}
                  </button>
                  <button onClick={loginAsGuest} className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                      {t.login.guest_button}
                  </button>
                </div>
            </div>
        </div>
    );
};