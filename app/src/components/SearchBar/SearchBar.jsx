import { Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaSearch } from 'react-icons/fa';

import './SearchBar.css';

/**
 * Barre de recherche
 * @param {*} param0
 * @returns
 */
const SearchBar = ({ placeholder }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <div className="search-bar-container">
            <InputGroup className="search-bar-group">
                <Button variant="outline-secondary" className="search-bar-button">
                    <FaSearch size={20} />
                </Button>
                <Form.Control placeholder={placeholder || t('navbar.search')} className="search-bar-text" />
            </InputGroup>
        </div>
    );
};

export default SearchBar;
