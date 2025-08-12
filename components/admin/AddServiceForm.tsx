import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AdminFormWrapper, FormFeedback, FormInput } from './AdminFormComponents';
import { useTranslations } from '../../context/LanguageContext';

interface AddServiceFormProps {
    onSuccess: () => void;
}

export const AddServiceForm: React.FC<AddServiceFormProps> = ({ onSuccess }) => {
    const { t } = useTranslations();
    const [form, setForm] = useState({ title: '', description: '', icon: '' });
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

        const { error } = await supabase.from('services').insert(form as any);
        if (error) {
            setFeedback({ message: `${t.adminForms.common.error_prefix} ${error.message}`, type: 'error' });
        } else {
            setFeedback({ message: t.adminForms.addService.success, type: 'success' });
            setForm({ title: '', description: '', icon: '' });
            setTimeout(() => onSuccess(), 1000);
        }
        setLoading(false);
    };

    return (
        <AdminFormWrapper titleKey="addService">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput name="title" id="title" label={t.adminForms.addService.title_label} value={form.title} onChange={handleChange} placeholder={t.adminForms.addService.title_placeholder} />
                <FormInput name="description" id="description" label={t.adminForms.addService.description_label} value={form.description} onChange={handleChange} type="textarea" placeholder={t.adminForms.addService.description_placeholder} />
                <FormInput name="icon" id="icon" label={t.adminForms.addService.icon_label} value={form.icon} onChange={handleChange} placeholder={t.adminForms.addService.icon_placeholder} />
                <FormFeedback message={feedback?.message || ''} type={feedback?.type || 'success'} />
                <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400">
                    {loading ? t.adminForms.common.adding_button : t.adminForms.addService.submit_button}
                </button>
            </form>
        </AdminFormWrapper>
    );
};