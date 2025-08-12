import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AdminFormWrapper, FormFeedback, FormInput } from './AdminFormComponents';
import { useTranslations } from '../../context/LanguageContext';

interface AddResourceFormProps {
    onSuccess: () => void;
}

export const AddResourceForm: React.FC<AddResourceFormProps> = ({ onSuccess }) => {
    const { t } = useTranslations();
    const [form, setForm] = useState({ title: '', description: '', url: '', category: '' });
    const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);
        if (!supabase) {
             setFeedback({ message: t.adminForms.common.supabase_not_configured, type: 'error' });
            setLoading(false);
            return;
        }
        
        const resourceData = { ...form, category: form.category || 'Junior Level' };
        
        const { error } = await supabase.from('resources').insert(resourceData as any);
        if (error) {
            setFeedback({ message: `${t.adminForms.common.error_prefix} ${error.message}`, type: 'error' });
        } else {
            setFeedback({ message: t.adminForms.addResource.success, type: 'success' });
            setForm({ title: '', description: '', url: '', category: '' });
            setTimeout(() => onSuccess(), 1000);
        }
        setLoading(false);
    };

    return (
        <AdminFormWrapper titleKey="addResource">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput name="title" id="title" label={t.adminForms.addResource.title_label} value={form.title} onChange={handleChange} />
                <FormInput name="description" id="description" label={t.adminForms.addResource.description_label} value={form.description} onChange={handleChange} type="textarea" />
                <FormInput name="url" id="url" label={t.adminForms.addResource.url_label} value={form.url} onChange={handleChange} type="url" />
                <FormInput name="category" id="category" label={t.adminForms.addResource.category_label} value={form.category} onChange={handleChange} type="select">
                    <option value="" disabled>{t.adminForms.common.select_level_placeholder}</option>
                    <option value="Junior Level">{t.resources.categories['Junior Level']}</option>
                    <option value="Mid-Level">{t.resources.categories['Mid-Level']}</option>
                    <option value="Senior Level">{t.resources.categories['Senior Level']}</option>
                </FormInput>
                <FormFeedback message={feedback?.message || ''} type={feedback?.type || 'success'} />
                <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400">
                    {loading ? t.adminForms.common.adding_button : t.adminForms.addResource.submit_button}
                </button>
            </form>
        </AdminFormWrapper>
    );
};