import React from 'react';
import type { Page } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { LabIcon } from './icons/LabIcon';
import { ResourcesIcon } from './icons/ResourcesIcon';
import { BriefingIcon } from './icons/BriefingIcon';
import { ResearchIcon } from './icons/ResearchIcon';
import { AdComponent } from './AdComponent';
import { ServicesIcon } from './icons/ServicesIcon';
import { useTranslations } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserManagementIcon } from './icons/UserManagementIcon';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-orange-500 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="ml-4">{label}</span>
    </a>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  
  const navItems: { label: Page; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { label: 'Dashboard', icon: <DashboardIcon /> },
    { label: 'Artur Creative Lab', icon: <LabIcon /> },
    { label: 'Services', icon: <ServicesIcon /> },
    { label: 'Research', icon: <ResearchIcon /> },
    { label: 'Resources', icon: <ResourcesIcon /> },
    { label: 'Briefings', icon: <BriefingIcon /> },
    { label: 'User Management', icon: <UserManagementIcon />, adminOnly: true },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center mb-8 px-2">
          <img src="https://i.postimg.cc/hPns2Rm2/horizontal-color.png" alt="Artur Creative Group Logo" className="w-48 h-auto" />
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') {
                return null;
            }
            return (
                <NavItem
                key={item.label}
                label={t.pageTitles[item.label]}
                icon={item.icon}
                isActive={currentPage === item.label}
                onClick={() => setCurrentPage(item.label)}
                />
            )
          })}
        </nav>
      </div>
       <div className="space-y-4">
            <AdComponent format="sidebar" />
            <div className="text-center text-xs text-gray-400">
                <p>&copy; {new Date().getFullYear()} Artur Creative Group</p>
                <p>{t.sidebar.footer_all_rights}</p>
            </div>
       </div>
    </aside>
  );
};