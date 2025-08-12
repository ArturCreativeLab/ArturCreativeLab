import React, { useState, useEffect, useCallback } from 'react';
import type { Project } from '../types';
import { AdComponent } from './AdComponent';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { AddProjectForm } from './admin/AddProjectForm';
import { useTranslations } from '../context/LanguageContext';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-1 group border border-gray-200">
    <img src={project.imageUrl} alt={project.title} className="w-full h-48 object-cover" />
    <div className="p-5">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
      <p className="text-gray-600 text-sm mb-4 h-16">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.tags.map(tag => (
          <span key={tag} className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse border border-gray-200">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-5">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="flex flex-wrap gap-2">
                <div className="bg-gray-200 h-5 w-16 rounded-full"></div>
                <div className="bg-gray-200 h-5 w-20 rounded-full"></div>
            </div>
        </div>
    </div>
);

export const CreativeLab: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslations();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        if (!supabase) {
            setProjects([]);
            setLoading(false);
            return;
        }
        
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            setError(t.creativeLab.error_message);
        } else {
            setProjects(data as Project[]);
        }
        setLoading(false);
    }, [t]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);
    
    const handleSuccess = () => {
        setShowAddForm(false);
        fetchProjects();
    };
    
    if (error) {
        return <div className="text-center text-red-600 bg-red-50 border border-red-200 p-6 rounded-lg">{error}</div>;
    }

    const adInsertionIndex = 2;
    const cards = loading 
        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)
        : projects.map(project => <ProjectCard key={project.id} project={project} />);
    
    if (!loading && projects.length > adInsertionIndex) {
        cards.splice(adInsertionIndex, 0, <AdComponent key="ad-creative-lab" format="card" />);
    }

    return (
        <div className="space-y-6">
            {user?.role === 'admin' && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
                    >
                        {showAddForm ? t.common.cancel : t.creativeLab.add_button}
                    </button>
                </div>
            )}
            {showAddForm && <AddProjectForm onSuccess={handleSuccess} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards}
            </div>
        </div>
    );
};