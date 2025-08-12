import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CreativeLab } from './components/CreativeLab';
import { Resources } from './components/Resources';
import { Briefings } from './components/Briefings';
import { Research } from './components/Research';
import { LoginScreen } from './components/LoginScreen';
import { useAuth } from './context/AuthContext';
import { Services } from './components/Services';
import type { Page } from './types';
import { useTranslations } from './context/LanguageContext';
import { UserManagement } from './components/UserManagement';

const App: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const { t } = useTranslations();

  if (!user) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Artur Creative Lab':
        return <CreativeLab />;
      case 'Services':
        return <Services />;
      case 'Resources':
        return <Resources />;
      case 'Briefings':
        return <Briefings />;
      case 'Research':
        return <Research />;
      case 'User Management':
        return user.role === 'admin' ? <UserManagement /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };
  
  const pageTitle = t.pageTitles[currentPage] || currentPage;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle} />
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;