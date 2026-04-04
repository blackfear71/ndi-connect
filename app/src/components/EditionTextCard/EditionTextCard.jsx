import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { FaArrowRightLong, FaArrowUpLong } from 'react-icons/fa6';

/**
 * Carte texte édition
 */
const EditionTextCard = ({ title, icon, text, limit = 200 }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [textContent, setTextContent] = useState({ expanded: false, isLong: false, text: '' });

    /**
     * Mise à jour du texte (avec troncature si trop long)
     */
    useEffect(() => {
        const isLong = text?.length > limit;

        setTextContent({
            expanded: false,
            isLong,
            text: isLong ? text.slice(0, limit) + '...' : (text ?? '')
        });
    }, [text]);

    /**
     * Plie ou déplie le texte
     */
    const toggle = () => {
        setTextContent((prev) => ({
            ...prev,
            expanded: !prev.expanded,
            text: !prev.expanded ? text : text.slice(0, limit) + '...'
        }));
    };

    return (
        <div className="edition-about-card mt-3">
            {/* Titre de la carte */}
            <div className="edition-about-card-header p-2">
                <div className="d-flex align-items-center gap-1 edition-about-card-title">
                    {icon}
                    {title}
                </div>
            </div>

            {/* Texte de la carte */}
            <div className="edition-about-card-body p-2">
                <div className="edition-about-card-text">{textContent.text}</div>
                {textContent.isLong && (
                    <button className="d-flex align-items-center p-0 mt-2 gap-1 edition-about-card-text-toggle" onClick={toggle}>
                        {textContent.expanded ? (
                            <>
                                {t('edition.readLess')}
                                <FaArrowUpLong size={10} />
                            </>
                        ) : (
                            <>
                                {t('edition.readMore')}
                                <FaArrowRightLong size={10} />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default EditionTextCard;
