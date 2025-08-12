import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AdminFormWrapper, FormFeedback, FormInput } from './AdminFormComponents';
import type { ExperienceLevel } from '../../types';
import { useTranslations } from '../../context/LanguageContext';

interface AddBriefingFormProps {
    onSuccess: () => void;
}

export const AddBriefingForm: React.FC<AddBriefingFormProps> = ({ onSuccess }) => {
    const { t } = useTranslations();
    const [form, setForm] = useState({ companyName: '', projectTitle: '', background: '', goals: '', targetAudience: '', deliverables: '', timeline: '', experienceLevel: 'Junior' });
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

        const briefingData = {
            companyName: form.companyName,
            projectTitle: form.projectTitle,
            background: form.background,
            goals: form.goals.split(',').map(g => g.trim()).filter(Boolean),
            targetAudience: form.targetAudience,
            deliverables: form.deliverables.split(',').map(d => d.trim()).filter(Boolean),
            timeline: form.timeline,
            experienceLevel: form.experienceLevel as ExperienceLevel,
        };

        const { error } = await supabase.from('briefings').insert(briefingData as any);
        if (error) {
            setFeedback({ message: `${t.adminForms.common.error_prefix} ${error.message}`, type: 'error' });
        } else {
            setFeedback({ message: t.adminForms.addBriefing.success, type: 'success' });
            setForm({ companyName: '', projectTitle: '', background: '', goals: '', targetAudience: '', deliverables: '', timeline: '', experienceLevel: 'Junior' });
            setTimeout(() => onSuccess(), 1000);
        }
        setLoading(false);
    };

    return (
        <AdminFormWrapper titleKey="addBriefing">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput name="companyName" id="companyName" label={t.adminForms.addBriefing.companyName_label} value={form.companyName} onChange={handleChange} />
                <FormInput name="projectTitle" id="projectTitle" label={t.adminForms.addBriefing.projectTitle_label} value={form.projectTitle} onChange={handleChange} />
                <FormInput name="background" id="background" label={t.adminForms.addBriefing.background_label} value={form.background} onChange={handleChange} type="textarea" />
                <FormInput name="goals" id="goals" label={t.adminForms.addBriefing.goals_label} value={form.goals} onChange={handleChange} />
                <FormInput name="targetAudience" id="targetAudience" label={t.adminForms.addBriefing.targetAudience_label} value={form.targetAudience} onChange={handleChange} />
                <FormInput name="deliverables" id="deliverables" label={t.adminForms.addBriefing.deliverables_label} value={form.deliverables} onChange={handleChange} />
                <FormInput name="timeline" id="timeline" label={t.adminForms.addBriefing.timeline_label} value={form.timeline} onChange={handleChange} />
                <FormInput name="experienceLevel" id="experienceLevel" label={t.adminForms.addBriefing.experienceLevel_label} value={form.experienceLevel} onChange={handleChange} type="select">
                    <option value="Junior">{t.resources.categories['Junior Level']}</option>
                    <option value="Mid-Level">{t.resources.categories['Mid-Level']}</option>
                    <option value="Senior">{t.resources.categories['Senior Level']}</option>
                </FormInput>
                <FormFeedback message={feedback?.message || ''} type={feedback?.type || 'success'} />
                <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400">
                    {loading ? t.adminForms.common.adding_button : t.adminForms.addBriefing.submit_button}
                </button>
            </form>
        </AdminFormWrapper>
    );
};