import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from '../context/LanguageContext';
import { verifyOrcid } from '../services/orcidService';
import { OrcidIcon } from './icons/OrcidIcon';

// In a real-world application, this secret should be handled on the backend and not exposed on the client.
// The "God Mode" ORCID is base64 encoded to obfuscate it.
const GOD_MODE_ORCID_ENCODED = 'MDAwMC0wMDAwLTAwMDAtMDAwMQ==';

const EditProfileModal: React.FC<{
    user: Profile;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ user, onClose, onSuccess }) => {
    const { t } = useTranslations();
    const [orcid, setOrcid] = useState(user.orcid || '');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ name: string; error: string } | null>(null);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerificationResult(null);
        setFeedback(null);
        try {
            const result = await verifyOrcid(orcid);
            setVerificationResult(result);
        } catch (error) {
            setVerificationResult({ name: '', error: t.userManagement.orcid_verification_error });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setFeedback(null);
        if (!supabase) {
            setFeedback({ message: 'Supabase not configured.', type: 'error' });
            setIsSaving(false);
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('update-user-profile', {
                body: { targetUserId: user.id, orcid },
            });

            if (error || data.error) {
                throw new Error(error?.message || data.error);
            }
            
            if (orcid === atob(GOD_MODE_ORCID_ENCODED)) {
                const { error: roleError } = await supabase.functions.invoke('set-user-role', {
                    body: { targetUserId: user.id, newRole: 'admin' },
                });
                if (roleError) {
                     setFeedback({ message: t.userManagement.update_success_role_fail, type: 'error' });
                } else {
                    setFeedback({ message: t.userManagement.update_success_role_granted, type: 'success' });
                }
            } else {
                 setFeedback({ message: t.userManagement.update_success, type: 'success' });
            }
            
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);

        } catch (error: any) {
            setFeedback({ message: `${t.userManagement.update_error}: ${error.message}`, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold">{t.userManagement.edit_profile_title.replace('{name}', user.full_name)}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="orcid" className="block text-sm font-medium text-gray-700">{t.userManagement.orcid_label}</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input
                                id="orcid"
                                type="text"
                                value={orcid}
                                onChange={(e) => setOrcid(e.target.value)}
                                placeholder={t.userManagement.orcid_placeholder}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <button onClick={handleVerify} disabled={isVerifying || !orcid} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50">
                                {isVerifying ? t.userManagement.verifying_button : t.userManagement.verify_button}
                            </button>
                        </div>
                    </div>
                    {verificationResult && (
                        <div className={`text-sm p-3 rounded-md ${verificationResult.name ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {verificationResult.name ? `${t.userManagement.verified_text} ${verificationResult.name}` : verificationResult.error}
                        </div>
                    )}
                    {feedback && (
                        <div className={`text-sm p-3 rounded-md ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {feedback.message}
                        </div>
                    )}
                </div>
                <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">{t.common.close}</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                        {isSaving ? t.common.loading : t.common.save}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslations();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

    const fetchProfiles = useCallback(async () => {
        if (user?.role !== 'admin' || !supabase) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc<Profile[]>('get_all_users');
            if (error) throw error;
            setProfiles(data || []);
        } catch (err: any) {
            setError(`${t.userManagement.error_fetching}: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [user, t]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleRoleChange = async (targetUserId: string, newRole: 'admin' | 'user') => {
        try {
            const { error } = await supabase.functions.invoke('set-user-role', {
                body: { targetUserId, newRole },
            });
            if (error) throw error;
            alert(t.userManagement.role_update_success);
            fetchProfiles();
        } catch (error: any) {
            alert(`${t.userManagement.role_update_error}: ${error.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900">{t.userManagement.title}</h2>
                <p className="mt-2 text-gray-600 max-w-2xl">{t.userManagement.description}</p>
            </div>

            {loading && <div className="text-center">{t.common.loading}</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            {!loading && !error && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t.userManagement.table_headers.user}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t.userManagement.table_headers.role}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t.userManagement.table_headers.orcid}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t.userManagement.table_headers.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {profiles.map((profile) => (
                                <tr key={profile.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={profile.picture} alt={profile.full_name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{profile.full_name}</div>
                                                <div className="text-sm text-gray-500">{profile.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {profile.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {profile.orcid ? (
                                            <a href={`https://orcid.org/${profile.orcid}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-green-600 hover:text-green-800">
                                                <OrcidIcon />
                                                <span>{profile.orcid}</span>
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => setSelectedUser(profile)} className="text-indigo-600 hover:text-indigo-900">{t.common.edit}</button>
                                        {profile.id !== user?.id && (
                                            profile.role === 'user' ? (
                                                <button onClick={() => handleRoleChange(profile.id, 'admin')} className="text-green-600 hover:text-green-900">{t.userManagement.promote_button}</button>
                                            ) : (
                                                <button onClick={() => handleRoleChange(profile.id, 'user')} className="text-red-600 hover:text-red-900">{t.userManagement.demote_button}</button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {selectedUser && <EditProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} onSuccess={fetchProfiles} />}
        </div>
    );
};