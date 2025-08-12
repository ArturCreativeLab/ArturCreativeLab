import React, { useState, useEffect, useCallback } from 'react';
import type { BriefingData, ExperienceLevel } from '../types';
import { AdComponent } from './AdComponent';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { AddBriefingForm } from './admin/AddBriefingForm';
import { useTranslations } from '../context/LanguageContext';

const BriefingDetail: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-800 sm:mt-0 sm:col-span-2">{children}</dd>
    </div>
);

const BriefingDisplay: React.FC<{ data: BriefingData; t: any }> = ({ data, t }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200">
    <div className="px-6 py-5">
      <h3 className="text-xl font-bold leading-6 text-gray-900">{data.projectTitle}</h3>
      <p className="mt-1 max-w-2xl text-sm text-gray-500">{t.briefings.client_label}: {data.companyName}</p>
    </div>
    <div className="border-t border-gray-200 px-6 py-5">
      <dl className="divide-y divide-gray-200">
        <BriefingDetail label={t.briefings.background_label}>{data.background}</BriefingDetail>
        <BriefingDetail label={t.briefings.goals_label}>
          <ul className="list-disc space-y-1 pl-5">
            {data.goals.map((goal, index) => <li key={index}>{goal}</li>)}
          </ul>
        </BriefingDetail>
        <BriefingDetail label={t.briefings.audience_label}>{data.targetAudience}</BriefingDetail>
        <BriefingDetail label={t.briefings.deliverables_label}>
           <ul className="list-disc space-y-1 pl-5">
            {data.deliverables.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </BriefingDetail>
        <BriefingDetail label={t.briefings.timeline_label}>{data.timeline}</BriefingDetail>
      </dl>
    </div>
  </div>
);

export const Briefings: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [briefings, setBriefings] = useState<BriefingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const levels: ExperienceLevel[] = ['Junior', 'Mid-Level', 'Senior'];

  const fetchBriefings = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
        setBriefings([]);
        setLoading(false);
        return;
    }
    const { data, error } = await supabase
      .from('briefings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching briefings:', error);
      setError(t.briefings.error_message);
    } else {
      setBriefings(data as BriefingData[]);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    fetchBriefings();
  }, [fetchBriefings]);

  const handleSuccess = () => {
    setShowAddForm(false);
    fetchBriefings();
  };
  
  if(loading) return <div className="text-center">{t.briefings.loading_message}</div>;
  if(error) return <div className="text-center text-red-600 bg-red-50 border border-red-200 p-6 rounded-lg">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-md mb-10 border border-gray-200">
        <div className="flex justify-between items-start">
            <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900">{t.briefings.title}</h2>
                <p className="mt-2 text-gray-600">
                  {t.briefings.description}
                </p>
            </div>
            {user?.role === 'admin' && (
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg flex-shrink-0"
                >
                    {showAddForm ? t.common.cancel : t.briefings.add_button}
                </button>
            )}
        </div>
      </div>
      
      {showAddForm && <div className="mb-10"><AddBriefingForm onSuccess={handleSuccess} /></div>}

      <div className="space-y-12">
        {levels.map(level => {
          const filteredBriefings = briefings.filter(b => b.experienceLevel === level);
          if (filteredBriefings.length === 0 && !loading) return null;

          return (
            <section key={level}>
              <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-orange-500 pb-2 mb-6">
                {t.briefings.level_title.replace('{level}', t.resources.categories[level] || level)}
              </h2>
              <div className="space-y-8">
                {filteredBriefings.map((briefing) => (
                  <BriefingDisplay key={briefing.id} data={briefing} t={t} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-12">
        <AdComponent format="banner" />
      </div>
    </div>
  );
};