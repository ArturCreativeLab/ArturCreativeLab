import React, { useState, useEffect, useCallback } from 'react';
import type { Service } from '../types';
import { supabase } from '../lib/supabaseClient';
import { AdComponent } from './AdComponent';
import { useAuth } from '../context/AuthContext';
import { AddServiceForm } from './admin/AddServiceForm';
import { useTranslations } from '../context/LanguageContext';

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
    <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-200 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-orange-500/20">
        <div className="text-5xl mb-4">{service.icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
        <p className="text-gray-600 text-sm">{service.description}</p>
    </div>
);

const SkeletonCard: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-200 animate-pulse">
        <div className="mx-auto bg-gray-200 rounded-full h-12 w-12 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mx-auto mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
    </div>
);

export const Services: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslations();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        if (!supabase) {
            setServices([]);
            setLoading(false);
            return;
        }
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching services:', error);
            setError(t.services.error_message);
        } else {
            setServices(data as Service[]);
        }
        setLoading(false);
    }, [t]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleSuccess = () => {
        setShowAddForm(false);
        fetchServices();
    };

    if (error) {
        return <div className="text-center text-red-600 bg-red-50 border border-red-200 p-6 rounded-lg">{error}</div>;
    }

    const cards = loading
        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)
        : services.map(service => <ServiceCard key={service.id} service={service} />);

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex justify-between items-center text-left">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{t.services.title}</h2>
                        <p className="mt-2 text-gray-600 max-w-2xl">
                            {t.services.description}
                        </p>
                    </div>
                     {user?.role === 'admin' && (
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg flex-shrink-0"
                        >
                            {showAddForm ? t.common.cancel : t.services.add_button}
                        </button>
                    )}
                </div>
            </div>

            {showAddForm && <AddServiceForm onSuccess={handleSuccess} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards}
            </div>
             <div className="pt-4">
                <AdComponent format="banner" />
            </div>
        </div>
    );
};