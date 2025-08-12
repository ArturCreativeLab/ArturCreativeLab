import React from 'react';
import { useTranslations } from '../context/LanguageContext';

// A collection of fake ad data
const ads = [
    {
        id: 1,
        headline: 'Supercharge Your Workflow with Nova AI',
        description: 'The last productivity tool you\'ll ever need. Automate tasks, write content, and more.',
        cta: 'Try for Free',
        imageUrl: 'https://picsum.photos/seed/ad-nova/600/500',
        brand: 'Nova AI'
    },
    {
        id: 2,
        headline: 'PixelPerfect Pro: Design at the Speed of Thought',
        description: 'A revolutionary design and prototyping tool for modern UI/UX teams.',
        cta: 'Learn More',
        imageUrl: 'https://picsum.photos/seed/ad-pixel/600/500',
        brand: 'PixelPerfect'
    },
    {
        id: 3,
        headline: 'SecureCloud Hosting - 99.9% Uptime Guaranteed',
        description: 'Blazing-fast, secure, and scalable hosting solutions for your web projects.',
        cta: 'Get Started',
        imageUrl: 'https://picsum.photos/seed/ad-cloud/600/500',
        brand: 'SecureCloud'
    }
];


interface AdComponentProps {
    format: 'sidebar' | 'card' | 'banner';
}

export const AdComponent: React.FC<AdComponentProps> = ({ format }) => {
    const { t } = useTranslations();
    // Pick a random ad to display
    const ad = React.useMemo(() => ads[Math.floor(Math.random() * ads.length)], []);

    const commonClasses = "rounded-lg shadow-md overflow-hidden relative group";
    const adLabel = (
        <span className="absolute top-2 right-2 bg-gray-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
            AD
        </span>
    );

    switch (format) {
        case 'sidebar':
            return (
                <a href="#" className={`${commonClasses} bg-gray-100 block border border-gray-200`}>
                    {adLabel}
                    <div className="p-4 text-center">
                        <h4 className="font-bold text-sm text-gray-800 mb-1">{ad.headline}</h4>
                        <p className="text-xs text-gray-500 mb-3">{ad.brand}</p>
                        <button className="bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md w-full hover:bg-orange-600 transition-colors">
                            {ad.cta}
                        </button>
                    </div>
                </a>
            );
        case 'card':
            return (
                <div className={`${commonClasses} bg-white/50 border border-gray-200 hover:border-orange-400/50 transition-all duration-300`}>
                    {adLabel}
                    <a href="#" className="block">
                        <img src={ad.imageUrl} alt={ad.headline} className="w-full h-48 object-cover" />
                        <div className="p-5">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{ad.brand}</p>
                            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">{ad.headline}</h3>
                            <p className="text-gray-600 text-sm h-16">{ad.description}</p>
                        </div>
                    </a>
                </div>
            );

        case 'banner':
        default:
            return (
                 <a href="#" className={`${commonClasses} bg-white flex items-center p-4 hover:bg-gray-50 transition-colors border border-gray-200`}>
                    {adLabel}
                    <img src={ad.imageUrl} alt={ad.headline} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                    <div className="ml-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase">{ad.brand} - {t.adComponent.advertisement}</p>
                        <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">{ad.headline}</h3>
                        <p className="text-gray-600 text-sm hidden sm:block">{ad.description}</p>
                    </div>
                    <div className="ml-auto pl-4">
                         <button className="bg-orange-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-orange-600 transition-colors whitespace-nowrap">
                            {ad.cta}
                        </button>
                    </div>
                </a>
            );
    }
};