import React, { useState, useEffect, useCallback } from 'react';
import type { Resource } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { AdComponent } from './AdComponent';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { AddResourceForm } from './admin/AddResourceForm';
import { useTranslations } from '../context/LanguageContext';

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white p-5 rounded-lg flex items-start space-x-4 shadow-md hover:bg-gray-50 hover:shadow-orange-500/10 transition-all duration-200 border border-gray-200"
  >
    <div className="flex-1">
      <h3 className="font-bold text-gray-800">{resource.title}</h3>
      <p className="text-gray-500 text-sm mt-1">{resource.description}</p>
    </div>
    <ExternalLinkIcon />
  </a>
);

export const Resources: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
     if (!supabase) {
        setResources([]);
        setLoading(false);
        return;
    }
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('category', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching resources:', error);
      setError(t.resources.error_message);
    } else {
      setResources(data as Resource[]);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSuccess = () => {
    setShowAddForm(false);
    fetchResources();
  };

  const categories = ['Junior Level', 'Mid-Level', 'Senior Level'];
  const groupedResources = categories.map(category => ({
      category,
      items: resources.filter(r => r.category === category)
  }));
  
  if (loading) {
      return <div>{t.resources.loading_message}</div>;
  }
  
  if (error) {
      return <div className="text-center text-red-600 bg-red-50 border border-red-200 p-6 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div></div>
        {user?.role === 'admin' && (
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
            >
                {showAddForm ? t.common.cancel : t.resources.add_button}
            </button>
        )}
      </div>
      {showAddForm && <AddResourceForm onSuccess={handleSuccess} />}

      {groupedResources.map(({ category, items }) => (
        (items.length > 0 || (category === 'Junior Level' && showAddForm)) && // show category if form is open
        <div key={category}>
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-orange-500 pb-2 mb-6">{t.resources.categories[category] || category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
            ))}
            {category === 'Mid-Level' && <AdComponent format="card" />}
          </div>
        </div>
      ))}
    </div>
  );
};