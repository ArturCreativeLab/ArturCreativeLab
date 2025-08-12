import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AdminFormWrapper, FormFeedback, FormInput } from './AdminFormComponents';
import { useTranslations } from '../../context/LanguageContext';

interface AddProjectFormProps {
    onSuccess: () => void;
}

export const AddProjectForm: React.FC<AddProjectFormProps> = ({ onSuccess }) => {
    const { t } = useTranslations();
    const [form, setForm] = useState({ title: '', description: '', imageUrl: '', tags: '' });
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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

        const projectData = {
            title: form.title,
            description: form.description,
            imageUrl: form.imageUrl,
            tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        };

        const { error } = await supabase.from('projects').insert(projectData as any);
        if (error) {
            setFeedback({ message: `${t.adminForms.common.error_prefix} ${error.message}`, type: 'error' });
        } else {
            setFeedback({ message: t.adminForms.addProject.success, type: 'success' });
            setForm({ title: '', description: '', imageUrl: '', tags: '' });
            setTimeout(() => onSuccess(), 1000); // Give user time to see success message
        }
        setLoading(false);
    };

    return (
        <AdminFormWrapper titleKey="addProject">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput name="title" id="title" label={t.adminForms.addProject.title_label} value={form.title} onChange={handleChange} placeholder={t.adminForms.addProject.title_placeholder} />
                <FormInput name="description" id="description" label={t.adminForms.addProject.description_label} value={form.description} onChange={handleChange} type="textarea" placeholder={t.adminForms.addProject.description_placeholder} />
                <FormInput name="imageUrl" id="imageUrl" label={t.adminForms.addProject.imageUrl_label} value={form.imageUrl} onChange={handleChange} type="url" placeholder={t.adminForms.addProject.imageUrl_placeholder} />
                <FormInput name="tags" id="tags" label={t.adminForms.addProject.tags_label} value={form.tags} onChange={handleChange} placeholder={t.adminForms.addProject.tags_placeholder} />
                <FormFeedback message={feedback?.message || ''} type={feedback?.type || 'success'} />
                <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400">
                    {loading ? t.adminForms.common.adding_button : t.adminForms.addProject.submit_button}
                </button>
            </form>
        </AdminFormWrapper>
    );
};