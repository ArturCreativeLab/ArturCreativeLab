import React, { useState, useEffect, useCallback } from 'react';
import type { ResearchArticle } from '../types';
import { AdComponent } from './AdComponent';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { AddResearchForm } from './admin/AddResearchForm';
import { useTranslations } from '../context/LanguageContext';

const ArticleCard: React.FC<{ article: ResearchArticle, t: any }> = ({ article, t }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col border border-gray-200">
        <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900">{article.title}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
                {t.research.by_author.replace('{authors}', article.authors.join(', '))} | {article.journal}, {new Date(article.publicationDate).toLocaleDateString()}
            </p>
            <p className="text-gray-600 text-sm mb-5">
                {article.abstract}
            </p>
        </div>
        <div className="flex-shrink-0">
             <div className="flex flex-wrap gap-2 mb-5">
                {article.tags.map(tag => (
                    <span key={tag} className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                ))}
            </div>
            <a 
                href={article.documentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-2 border border-orange-500 text-sm font-medium rounded-md text-orange-600 bg-transparent hover:bg-orange-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-orange-500 transition-colors"
            >
                {t.research.read_document_button}
                <span className="ml-2"><ExternalLinkIcon /></span>
            </a>
        </div>
    </div>
);

export const Research: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslations();
    const [articles, setArticles] = useState<ResearchArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        if (!supabase) {
            setArticles([]);
            setLoading(false);
            return;
        }
        const { data, error } = await supabase
            .from('research_articles')
            .select('*')
            .order('publicationDate', { ascending: false });

        if (error) {
            console.error('Error fetching articles:', error);
            setError(t.research.error_message);
        } else {
            setArticles(data as ResearchArticle[]);
        }
        setLoading(false);
    }, [t]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleSuccess = () => {
        setShowAddForm(false);
        fetchArticles();
    };

    if (loading) return <div className="text-center">{t.research.loading_message}</div>;
    if (error) return <div className="text-center text-red-600 bg-red-50 border border-red-200 p-6 rounded-lg">{error}</div>;

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex justify-between items-center text-left">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t.research.title}</h2>
                        <p className="mt-2 text-gray-600 max-w-2xl">
                           {t.research.description}
                        </p>
                    </div>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg flex-shrink-0"
                        >
                            {showAddForm ? t.common.cancel : t.research.add_button}
                        </button>
                    )}
                </div>
            </div>

            {showAddForm && <AddResearchForm onSuccess={handleSuccess} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {articles.map(article => (
                    <ArticleCard key={article.id} article={article} t={t} />
                ))}
            </div>
             <div className="pt-4">
                <AdComponent format="banner" />
            </div>
        </div>
    );
};