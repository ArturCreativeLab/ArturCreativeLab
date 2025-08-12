import React from 'react';
import { useTranslations } from '../../context/LanguageContext';

export const AdminFormWrapper: React.FC<{ titleKey: string; children: React.ReactNode }> = ({ titleKey, children }) => {
  const { t } = useTranslations();
  const title = t.adminForms.titles[titleKey] || 'Admin Form';
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
      {children}
    </div>
  );
};

export const FormFeedback: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => {
  if (!message) return null;
  const baseClasses = 'p-4 rounded-md text-sm my-4';
  const typeClasses = type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200';
  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
}

export const FormInput: React.FC<{
    id: string;
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    children?: React.ReactNode;
}> = ({ id, name, label, value, onChange, type = "text", required = true, placeholder, rows, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {type === 'textarea' ? (
            <textarea id={id} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={rows || 4} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        ) : type === 'select' ? (
             <select id={id} name={name} value={value} onChange={onChange} required={required} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                {children}
             </select>
        ) : (
            <input type={type} id={id} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        )}
    </div>
);