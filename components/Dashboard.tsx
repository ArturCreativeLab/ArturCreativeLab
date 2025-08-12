
import React, { useEffect, useState } from 'react';
import { AdComponent } from './AdComponent';
import { supabase } from '../lib/supabaseClient';
import { useTranslations } from '../context/LanguageContext';

const StatCard: React.FC<{ title: string; value: string; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-orange-500/20 transition-shadow duration-300 transform hover:-translate-y-1 border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className="text-4xl text-orange-500">{icon}</div>
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
  const { t } = useTranslations();
  const [stats, setStats] = useState({
    projects: '0',
    services: '0',
    resources: '0',
    briefings: '0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [projectsCount, servicesCount, resourcesCount, briefingsCount] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('services').select('*', { count: 'exact', head: true }),
          supabase.from('resources').select('*', { count: 'exact', head: true }),
          supabase.from('briefings').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          projects: projectsCount.count?.toString() ?? '0',
          services: servicesCount.count?.toString() ?? '0',
          resources: resourcesCount.count?.toString() ?? '0',
          briefings: briefingsCount.count?.toString() ?? '0',
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: t.dashboard.stat_cards.projects, value: loading ? '...' : stats.projects, icon: "🔬" },
    { title: t.dashboard.stat_cards.services, value: loading ? '...' : stats.services, icon: "💼" },
    { title: t.dashboard.stat_cards.resources, value: loading ? '...' : stats.resources, icon: "📚" },
    { title: t.dashboard.stat_cards.briefings, value: loading ? '...' : stats.briefings, icon: "📄" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.welcome_title}</h1>
        <p className="mt-2 text-gray-600 max-w-3xl">
          {t.dashboard.welcome_desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(card => <StatCard key={card.title} {...card} />)}
      </div>

      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">{t.dashboard.mission_title}</h2>
        <p className="mt-4 text-gray-600">
          {t.dashboard.mission_desc}
        </p>
      </div>

      <div className="pt-4">
        <AdComponent format="banner" />
      </div>
    </div>
  );
};