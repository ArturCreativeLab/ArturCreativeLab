import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AdminFormWrapper, FormFeedback, FormInput } from './AdminFormComponents';
import { useTranslations } from '../../context/LanguageContext';

interface AddResearchFormProps {
    onSuccess: () => void;
}

export const AddResearchForm: React.FC<AddResearchFormProps> = ({ onSuccess }) => {
    const { t } = useTranslations();
    const [form, setForm] = useState({ title: '', authors: '', publicationDate: '', journal: '', abstract: '', tags: '', documentUrl: '' });
    const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);
        if (!supabase) {
            setFeedback({ message: t.adminForms.common.supabase_not_configured, type: 'error' });
            setLoading(false);
            return;
        }

        const researchData = {
            title: form.title,
            authors: form.authors.split(',').map(author => author.trim()).filter(Boolean),
            publicationDate: form.publicationDate,
            journal: form.journal,
            abstract: form.abstract,
            tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            documentUrl: form.documentUrl,
        };

        const { error } = await supabase.from('research_articles').insert(researchData as any);
        if (error) {
            setFeedback({ message: `${t.adminForms.common.error_prefix} ${error.message}`, type: 'error' });
        } else {
            setFeedback({ message: t.adminForms.addResearch.success, type: 'success' });
            setForm({ title: '', authors: '', publicationDate: '', journal: '', abstract: '', tags: '', documentUrl: '' });
            setTimeout(() => onSuccess(), 1000);
        }
        setLoading(false);
    };

    return (
        <AdminFormWrapper titleKey="addResearch">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput name="title" id="title" label={t.adminForms.addResearch.title_label} value={form.title} onChange={handleChange} />
                <FormInput name="authors" id="authors" label={t.adminForms.addResearch.authors_label} value={form.authors} onChange={handleChange} />
                <FormInput name="publicationDate" id="publicationDate" label={t.adminForms.addResearch.publicationDate_label} value={form.publicationDate} onChange={handleChange} type="date" />
                <FormInput name="journal" id="journal" label={t.adminForms.addResearch.journal_label} value={form.journal} onChange={handleChange} />
                <FormInput name="abstract" id="abstract" label={t.adminForms.addResearch.abstract_label} value={form.abstract} onChange={handleChange} type="textarea" />
                <FormInput name="tags" id="tags" label={t.adminForms.addResearch.tags_label} value={form.tags} onChange={handleChange} />
                <FormInput name="documentUrl" id="documentUrl" label={t.adminForms.addResearch.documentUrl_label} value={form.documentUrl} onChange={handleChange} type="url" />
                <FormFeedback message={feedback?.message || ''} type={feedback?.type || 'success'} />
                <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400">
                    {loading ? t.adminForms.common.adding_button : t.adminForms.addResearch.submit_button}
                </button>
            </form>
        </AdminFormWrapper>
    );
};