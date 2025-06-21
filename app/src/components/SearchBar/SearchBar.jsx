import { useEffect, useRef, useState } from 'react';

import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import EditionsService from '../../api/editionsService';

import Message from '../../components/Message/Message';

import { combineLatest, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import './SearchBar.css';

/**
 * Barre de recherche
 * @param {*} param0
 * @returns
 */
const SearchBar = ({ placeholder }) => {
    // Router
    const navigate = useNavigate();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [message, setMessage] = useState(null);
    const [searchMessage, setSearchMessage] = useState(null);
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
        setMessage(null);
        setSearchMessage(null);
        setSearchText(value);

        // On lance la recherche seulement à partir de 3 caractères saisis
        if (value.length === 0) {
            setResults([]);
            setShowResults(false);
        } else if (value.length > 2) {
            const editionsService = new EditionsService();

            const subscriptionEditions = editionsService.getSearchEditions({ search: value });

            combineLatest([subscriptionEditions])
                .pipe(
                    map(([dataEditions]) => {
                        if (dataEditions.response.data.length === 0) {
                            setSearchMessage('messages.noResults');
                        }

                        setResults(dataEditions.response.data);
                        setShowResults(true);
                    }),
                    take(1),
                    catchError((err) => {
                        setMessage({ code: err?.response?.message, type: err?.response?.status });
                        return of();
                    })
                )
                .subscribe();
        } else {
            setResults([]);
            setSearchMessage('messages.searchMessage');
            setShowResults(true);
            return;
        }
    };

    /**
     * Vide la zone de recherche
     */
    const handleClear = () => {
        // Vide les résultats
        setSearchText('');
        setResults([]);
        setShowResults(false);

        // Met le curseur sur la zone de saisie
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

    /**
     * Redirige vers le résultat de la recherche
     * @param {*} id Identifiant de l'édition
     */
    const handleResultClick = (id) => {
        // Vide les résultats
        setSearchText('');
        setResults([]);
        setShowResults(false);

        // Redirige vers l'édition
        navigate(`/edition/${id}`);
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

            {/* Messages */}
            {showResults && searchMessage && (
                <div className="search-results-dropdown">
                    <div className="search-result-message">{t(searchMessage)}</div>
                </div>
            )}

            {message && (
                <div className="search-results-dropdown">
                    <div className="search-result-message search-result-message-no-margin-bottom">
                        <Message code={message.code} type={message.type} setMessage={setMessage} />
                    </div>
                </div>
            )}

            {/* Résultats */}
            {showResults && results.length > 0 && (
                <div className="search-results-dropdown">
                    {results.map((item, idx) => (
                        <div key={idx} className="search-result-item" onClick={() => handleResultClick(item.id)}>
                            <div className="search-result-item-left">{item.location}</div>
                            <div className="search-result-item-right">{t('edition.editionResult', { year: item.year })}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
