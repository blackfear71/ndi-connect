import { useEffect, useRef, useState } from 'react';

import { Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaTimes } from 'react-icons/fa';

import './SearchBar.css';

/**
 * Barre de recherche
 * @param {*} param0
 * @returns
 */
const SearchBar = ({ placeholder }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [searchText, setSearchText] = useState('');
    const [showResults, setShowResults] = useState(false);

    // API states
    const [results, setResults] = useState([]);

    /**
     * Affecte un évènement lors du clic en dehors de la zone
     */
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Lance la recherche
     */
    const handleChange = async (e) => {
        const value = e.target.value;
        setSearchText(value);

        // TODO : back recherche (éditions seulement pour l'instant)
        if (value.length > 1) {
            const data = await mockResults(value);
            setResults(data);
            setShowResults(true);
        } else {
            setResults([]);
            setShowResults(false);
        }
    };

    // TODO : à supprimer
    const mockResults = (text) =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { result: `Résultat pour "${text}" 1`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 2`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 3`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 4`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 5`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 6`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 7`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 8`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 9`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 10`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 11`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 12`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 13`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 14`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 15`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 16`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 17`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 18`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 19`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 20`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 21`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 22`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 23`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 24`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 25`, category: 'Edition' },
                    { result: `Résultat pour "${text}" 26`, category: 'Edition' }
                ]);
            }, 300);
        });

    /**
     * Vide la zone de recherche
     */
    const handleClear = () => {
        setSearchText('');
        setResults([]);
        setShowResults(false);
        inputRef.current?.focus();
    };

    /**
     * Ferme la zone de recherche au clic en dehors
     * @param {*} e Evènement
     */
    const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
            setShowResults(false);
        }
    };

    /**
     * Réaffiche la zone de recherche au clic sur la saisie
     */
    const handleFocus = () => {
        if (searchText.length > 1 && results.length > 0) {
            setShowResults(true);
        }
    };

    return (
        <div className="search-bar-container" ref={containerRef}>
            {/* Barre de recherche */}
            <div className="search-bar-wrapper">
                <FaSearch className="search-bar-icon search-icon" />
                <Form.Control
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder || t('navbar.search')}
                    className="search-bar-text"
                    value={searchText}
                    onChange={handleChange}
                    onFocus={handleFocus}
                />
                {searchText && <FaTimes className="search-bar-icon clear-icon" onClick={handleClear} />}
            </div>

            {/* Résultats */}
            {showResults && results.length > 0 && (
                <div className="search-results-dropdown">
                    {results.map((item, idx) => (
                        <div key={idx} className="search-result-item">
                            <div className="search-result-item-left">{item.result}</div>
                            <div className="search-result-item-right">{item.category}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
